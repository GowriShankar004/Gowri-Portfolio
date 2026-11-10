import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CHAT, SECTIONS, STATS } from '../../data/portfolio.data';
import { ApiService, ChatTurn } from '../../core/api.service';
import { MotionService } from '../../core/motion.service';
import { CountUpDirective } from '../../shared/count-up.directive';
import { SectionHeadComponent } from '../../shared/section-head.component';

const MAX_QUESTION = 500;

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadComponent, CountUpDirective, FormsModule],
  styles: ':host{display:contents}',
  templateUrl: './about.component.html',
})
export class AboutComponent {
  protected readonly head = SECTIONS.about;
  protected readonly stats = STATS;
  protected readonly questions = CHAT;
  protected readonly maxQuestion = MAX_QUESTION;
  protected readonly api = inject(ApiService);

  /** The first answer is complete in the prerendered HTML; it re-streams once the chat scrolls into view. */
  protected readonly question = signal(CHAT[0].question);
  protected readonly activeKey = signal<string | null>(CHAT[0].key);
  protected readonly shown = signal(CHAT[0].answer);
  protected readonly streaming = signal(false);
  protected readonly error = signal('');
  protected readonly live = signal(false);
  protected draft = '';

  private readonly motion = inject(MotionService);
  private readonly history: ChatTurn[] = [];
  private streamId = 0;
  private interacted = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private abort: AbortController | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    destroyRef.onDestroy(() => {
      clearTimeout(this.timer);
      this.abort?.abort();
    });

    afterNextRender(() => {
      void this.api.checkHealth();
      const win = host.querySelector('.window');
      if (!win || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        // Replay the intro answer only if the visitor hasn't already asked something.
        if (!this.interacted) this.playIntro();
      }, { threshold: 0.5 });
      io.observe(win);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  /** A suggested question: answered instantly from the written answers, no API needed. */
  protected pick(key: string): void {
    this.interacted = true;
    this.answerFromScript(key);
  }

  private playIntro(): void {
    this.answerFromScript(CHAT[0].key);
  }

  private answerFromScript(key: string): void {
    const answer = CHAT.find(c => c.key === key);
    if (!answer) return;
    this.begin(answer.question, key, false);
    this.typeOut(answer.answer, this.streamId);
  }

  /** A free-form question: answered live by the AI through the API. */
  protected async askLive(): Promise<void> {
    this.interacted = true;
    const question = this.draft.trim();
    if (!question) {
      this.error.set('Type a question first.');
      return;
    }
    if (question.length > MAX_QUESTION) {
      this.error.set(`Keep it under ${MAX_QUESTION} characters.`);
      return;
    }
    this.draft = '';
    this.begin(question, null, true);
    const id = this.streamId;
    this.abort = new AbortController();
    let text = '';
    try {
      for await (const chunk of this.api.ask(question, [...this.history], this.abort.signal)) {
        if (id !== this.streamId) return;
        text += chunk;
        this.shown.set(text);
      }
      this.history.push({ role: 'user', text: question }, { role: 'assistant', text });
    } catch (e) {
      if (id !== this.streamId || (e as Error).name === 'AbortError') return;
      this.error.set((e as Error).message || "The chat couldn't answer right now.");
      if (!text) this.shown.set('');
    } finally {
      if (id === this.streamId) this.streaming.set(false);
    }
  }

  protected clearError(): void {
    if (this.error()) this.error.set('');
  }

  private begin(question: string, key: string | null, live: boolean): void {
    ++this.streamId;
    clearTimeout(this.timer);
    this.abort?.abort();
    this.question.set(question);
    this.activeKey.set(key);
    this.live.set(live);
    this.error.set('');
    this.shown.set('');
    this.streaming.set(true);
  }

  /** Reveals a written answer a word or two at a time, like an assistant replying. */
  private typeOut(answer: string, id: number): void {
    if (this.motion.reducedMotion) {
      this.shown.set(answer);
      this.streaming.set(false);
      return;
    }
    const words = answer.split(' ');
    let i = 0;
    const step = () => {
      if (id !== this.streamId) return;
      i = Math.min(words.length, i + 1 + Math.floor(Math.random() * 2));
      this.shown.set(words.slice(0, i).join(' '));
      if (i < words.length) this.timer = setTimeout(step, 38 + Math.random() * 50);
      else this.streaming.set(false);
    };
    step();
  }
}
