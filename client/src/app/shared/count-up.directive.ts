import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';
import { MotionService } from '../core/motion.service';

/** Counts a number up when it scrolls into view. The final value is in the prerendered HTML. */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective {
  readonly appCountUp = input.required<number>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (motion.reducedMotion || !('IntersectionObserver' in window)) return;
      let frame = 0;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const end = this.appCountUp();
        const start = end > 1000 ? end - 40 : 0;
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / 1400);
          el.textContent = String(Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3))));
          if (k < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      }, { threshold: 0.6 });
      io.observe(el);
      destroyRef.onDestroy(() => {
        io.disconnect();
        cancelAnimationFrame(frame);
      });
    });
  }
}
