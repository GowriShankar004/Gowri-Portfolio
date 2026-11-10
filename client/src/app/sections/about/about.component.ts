import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { CHAT, SECTIONS, STATS } from '../../data/portfolio.data';
import { ChatAnswer } from '../../models/portfolio.models';
import { MotionService } from '../../core/motion.service';
import { CountUpDirective } from '../../shared/count-up.directive';
import { SectionHeadComponent } from '../../shared/section-head.component';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadComponent, CountUpDirective],
  styles: ':host{display:contents}',
  templateUrl: './about.component.html',
})
export class AboutComponent {
  protected readonly head = SECTIONS.about;
  protected readonly stats = STATS;
  protected readonly questions = CHAT;

  /** The first answer is complete in the prerendered HTML; it re-streams once the chat scrolls into view. */
  protected readonly current = signal<ChatAnswer>(CHAT[0]);
  protected readonly shown = signal(CHAT[0].answer);
  protected readonly streaming = signal(false);

  private readonly motion = inject(MotionService);
  private streamId = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    destroyRef.onDestroy(() => clearTimeout(this.timer));

    afterNextRender(() => {
      const win = host.querySelector('.window');
      if (!win || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        this.ask(CHAT[0]);
      }, { threshold: 0.5 });
      io.observe(win);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  /** Streams the answer a word or two at a time, like an assistant replying. */
  protected ask(answer: ChatAnswer): void {
    const id = ++this.streamId;
    clearTimeout(this.timer);
    this.current.set(answer);
    if (this.motion.reducedMotion) {
      this.shown.set(answer.answer);
      this.streaming.set(false);
      return;
    }
    const words = answer.answer.split(' ');
    let i = 0;
    this.streaming.set(true);
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
