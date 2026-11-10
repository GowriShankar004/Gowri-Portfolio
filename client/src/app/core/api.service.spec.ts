import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_URL, ApiService, readServerSentEvents } from './api.service';

function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach(c => controller.enqueue(enc.encode(c)));
      controller.close();
    },
  });
}

function service(apiUrl: string): ApiService {
  TestBed.configureTestingModule({ providers: [{ provide: API_URL, useValue: apiUrl }] });
  return TestBed.inject(ApiService);
}

async function collect(it: AsyncIterable<string>): Promise<string> {
  let out = '';
  for await (const chunk of it) out += chunk;
  return out;
}

afterEach(() => {
  vi.unstubAllGlobals();
  TestBed.resetTestingModule();
});

describe('readServerSentEvents', () => {
  it('parses events split across network chunks, keeping leading spaces in the text', async () => {
    const events = [];
    for await (const e of readServerSentEvents(streamOf('event: delta\ndata: Hel', 'lo\n\nevent: delta\ndata:  there\n\n', 'event: done\ndata: \n\n'))) {
      events.push(e);
    }
    expect(events).toEqual([
      { name: 'delta', data: 'Hello' },
      { name: 'delta', data: ' there' },
      { name: 'done', data: '' },
    ]);
  });
});

describe('ApiService', () => {
  it('keeps every live feature off when no API URL is set', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const api = service('');

    await api.checkHealth();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(api.chatAvailable()).toBe(false);
    expect(api.contactAvailable()).toBe(false);
  });

  it('keeps features off when the API is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const api = service('http://api.test');

    await api.checkHealth();

    expect(api.chatAvailable()).toBe(false);
  });

  it('turns on the features the API reports', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok', chat: true, email: false }))));
    const api = service('http://api.test');

    await api.checkHealth();

    expect(api.chatAvailable()).toBe(true);
    expect(api.contactAvailable()).toBe(false);
  });

  it('streams a chat answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(streamOf('event: delta\ndata: I build\n\nevent: delta\ndata:  .NET APIs.\n\nevent: done\ndata: \n\n'), {
        headers: { 'Content-Type': 'text/event-stream' },
      }),
    ));
    const api = service('http://api.test');

    expect(await collect(api.ask('What do you build?', []))).toBe('I build .NET APIs.');
  });

  it("raises the server's message when the stream ends in an error", async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(streamOf('event: error\ndata: The chat is busy right now.\n\n'))));
    const api = service('http://api.test');

    await expect(collect(api.ask('Hi', []))).rejects.toThrow('The chat is busy right now.');
  });

  it('explains rate limiting in plain words', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
    const api = service('http://api.test');

    await expect(collect(api.ask('Hi', []))).rejects.toThrow(/Wait a minute/);
  });

  it('returns field errors from a rejected contact message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errors: { Email: ['Enter a valid email address.'] } }), { status: 400 }),
    ));
    const api = service('http://api.test');

    const result = await api.sendContact({ name: 'A', email: 'bad', message: 'Hello there!', website: '' });

    expect(result).toEqual({ ok: false, message: 'Check the highlighted fields.', fieldErrors: { Email: ['Enter a valid email address.'] } });
  });
});
