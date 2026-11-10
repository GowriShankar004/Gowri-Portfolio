import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { MotionService } from '../core/motion.service';

/** Page-wide decoration: the scroll progress bar, the cursor glow and the drifting background light. */
@Component({
  selector: 'app-ambient',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host{display:contents}',
  template: `
    <div id="progress"></div>
    <div id="glow" aria-hidden="true"></div>
    <div id="amb" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div>
  `,
})
export class AmbientComponent {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const progress = host.querySelector<HTMLElement>('#progress')!;
      const glow = host.querySelector<HTMLElement>('#glow')!;
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      const onMove = (e: PointerEvent) => {
        glow.style.opacity = '1';
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      };
      const glowOn = !motion.reducedMotion && motion.finePointer;
      if (glowOn) addEventListener('pointermove', onMove, { passive: true });

      destroyRef.onDestroy(() => {
        removeEventListener('scroll', onScroll);
        if (glowOn) removeEventListener('pointermove', onMove);
      });
    });
  }
}
