import { Injectable, InjectionToken, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

/** Base URL of the .NET API; empty means the site runs without it. */
export const API_URL = new InjectionToken<string>('API_URL', { providedIn: 'root', factory: () => environment.apiUrl });

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** Honeypot: always empty for people. */
  website: string;
}

export type ContactResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

/**
 * Talks to the portfolio API. Features light up only after the health check says they're configured,
 * so the static site keeps working exactly as before when the API is missing or down.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = inject(API_URL).replace(/\/$/, '');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private checked = false;

  readonly chatAvailable = signal(false);
  readonly contactAvailable = signal(false);

  /** Asks the API which features are on. Safe to call more than once. */
  async checkHealth(): Promise<void> {
    if (!this.isBrowser || !this.baseUrl || this.checked) return;
    this.checked = true;
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return;
      const body = (await res.json()) as { chat?: boolean; email?: boolean };
      this.chatAvailable.set(!!body.chat);
      this.contactAvailable.set(!!body.email);
    } catch {
      /* API unreachable: stay on the static experience */
    }
  }

  /**
   * Streams the answer to a question as text fragments. Throws with a readable message if the
   * request is rejected, and surfaces the server's own message if the stream ends with an error.
   */
  async *ask(question: string, history: ChatTurn[], signal?: AbortSignal): AsyncGenerator<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
      signal,
    });
    if (res.status === 429) throw new Error("You're asking quickly. Wait a minute and try again.");
    if (!res.ok || !res.body) throw new Error((await problemMessage(res)) ?? "The chat couldn't answer right now.");

    for await (const event of readServerSentEvents(res.body)) {
      if (event.name === 'delta') yield event.data;
      else if (event.name === 'error') throw new Error(event.data);
      else if (event.name === 'done') return;
    }
  }

  async sendContact(message: ContactMessage): Promise<ContactResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (res.ok) return { ok: true };
      if (res.status === 429) return { ok: false, message: "You've sent a few messages already. Try again later, or email me directly." };
      const body = (await res.json().catch(() => null)) as { detail?: string; errors?: Record<string, string[]> } | null;
      return { ok: false, message: body?.detail ?? 'Check the highlighted fields.', fieldErrors: body?.errors };
    } catch {
      return { ok: false, message: "Your message couldn't be sent. Check your connection, or email me directly." };
    }
  }
}

async function problemMessage(res: Response): Promise<string | undefined> {
  const body = (await res.json().catch(() => null)) as { detail?: string; errors?: Record<string, string[]> } | null;
  return body?.errors ? Object.values(body.errors).flat()[0] : body?.detail;
}

export interface ServerSentEvent {
  name: string;
  data: string;
}

/** Minimal text/event-stream parser: yields one event per blank-line-terminated block. */
export async function* readServerSentEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ServerSentEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let end: number;
      while ((end = buffer.search(/\r?\n\r?\n/)) >= 0) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end).replace(/^\r?\n\r?\n/, '');
        let name = 'message';
        const data: string[] = [];
        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith('event:')) name = line.slice(6).trim();
          else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
        }
        if (data.length) yield { name, data: data.join('\n') };
      }
    }
  } finally {
    reader.releaseLock();
  }
}
