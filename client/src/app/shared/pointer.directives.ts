import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { MotionService } from '../core/motion.service';

/** Shared setup: listen on the host for mouse-type pointers only, and clean up on destroy. */
function onFinePointer(
  host: HTMLElement,
  motion: MotionService,
  destroyRef: DestroyRef,
  move: (e: PointerEvent, rect: DOMRect) => void,
  leave: () => void,
): void {
  afterNextRender(() => {
    if (motion.reducedMotion || !motion.finePointer) return;
    const onMove = (e: PointerEvent) => move(e, host.getBoundingClientRect());
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', leave);
    destroyRef.onDestroy(() => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', leave);
    });
  });
}

/** A soft light follows the cursor across the card (reads --mx/--my in CSS). */
@Directive({ selector: '[appSpotlight]' })
export class SpotlightDirective {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    onFinePointer(host, inject(MotionService), inject(DestroyRef), (e, r) => {
      host.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      host.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }, () => undefined);
  }
}

/** Buttons lean toward the cursor. */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    onFinePointer(host, inject(MotionService), inject(DestroyRef), (e, r) => {
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      host.style.transform = `translate(${x}px,${y}px)`;
    }, () => (host.style.transform = ''));
  }
}
