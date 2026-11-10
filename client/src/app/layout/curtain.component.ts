import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NavigationService } from '../core/navigation.service';

const EASE = 'cubic-bezier(.76,0,.24,1)';

/** Two gradient panels sweep across, name the destination, then sweep away to reveal it. */
@Component({
  selector: 'app-curtain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host{display:contents}',
  template: `
    <div class="curtain" aria-hidden="true">
      <i class="c1"></i>
      <i class="c2"><span class="num">{{ counter() }}</span><span class="name">{{ label() }}</span></i>
    </div>
  `,
})
export class CurtainComponent {
  protected readonly label = signal('');
  protected readonly counter = signal('');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const nav = inject(NavigationService);

    afterNextRender(() => {
      const curtain = host.querySelector<HTMLElement>('.curtain');
      if (!curtain || typeof curtain.animate !== 'function') return;
      const [c1, c2] = [...curtain.querySelectorAll<HTMLElement>('i')];
      const num = curtain.querySelector<HTMLElement>('.num')!;
      const name = curtain.querySelector<HTMLElement>('.name')!;
      const wipe = (el: HTMLElement, from: string, to: string, duration: number, delay = 0) =>
        el.animate([{ clipPath: from }, { clipPath: to }], { duration, delay, easing: EASE, fill: 'forwards' }).finished;

      nav.registerCurtain(async (label, counter, swap) => {
        this.label.set(label);
        this.counter.set(counter);
        curtain.classList.add('on');
        await Promise.all([
          wipe(c1, 'inset(0 100% 0 0)', 'inset(0 0% 0 0)', 520),
          wipe(c2, 'inset(0 100% 0 0)', 'inset(0 0% 0 0)', 520, 110),
        ]);
        const rise = [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }];
        num.animate(rise, { duration: 380, easing: EASE, fill: 'forwards' });
        await name.animate(rise, { duration: 480, delay: 60, easing: EASE, fill: 'forwards' }).finished;
        swap();
        await new Promise(resolve => setTimeout(resolve, 260));
        await Promise.all([
          wipe(c2, 'inset(0 0 0 0%)', 'inset(0 0 0 100%)', 560),
          wipe(c1, 'inset(0 0 0 0%)', 'inset(0 0 0 100%)', 560, 110),
        ]);
        [num, name, c1, c2].forEach(el => el.getAnimations().forEach(a => a.cancel()));
        curtain.classList.remove('on');
      });
    });
  }
}
