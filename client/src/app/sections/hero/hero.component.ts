import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PROFILE } from '../../data/portfolio.data';
import { MotionService } from '../../core/motion.service';
import { NavigationService, SectionId } from '../../core/navigation.service';
import { IconComponent } from '../../shared/icons.component';
import { MagneticDirective } from '../../shared/pointer.directives';

/** Chip positions around the portrait, and how far each drifts with the cursor. */
const CHIP_DEPTHS = [18, -14, 12, -20, 10];

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, IconComponent, MagneticDirective],
  styles: ':host{display:contents}',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  protected readonly profile = PROFILE;
  protected readonly chips = PROFILE.heroChips.map((text, i) => ({ text, cls: `fl f${i + 1}`, depth: CHIP_DEPTHS[i] }));

  /** The typed line starts on the first role (also what the prerendered HTML shows). */
  protected readonly verb = signal(PROFILE.typedRoles[0][0]);
  protected readonly typed = signal(PROFILE.typedRoles[0][1]);

  private readonly nav = inject(NavigationService);

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    afterNextRender(() => {
      if (motion.reducedMotion) return;
      const timer = this.typeRoles();
      const unbind = this.bindChipParallax(host, motion);
      destroyRef.onDestroy(() => {
        clearTimeout(timer.id);
        unbind();
      });
    });
  }

  protected go(event: Event, id: SectionId): void {
    if (this.nav.travel(id)) event.preventDefault();
  }

  /** Deletes and retypes each role in turn. */
  private typeRoles(): { id?: ReturnType<typeof setTimeout> } {
    const roles = PROFILE.typedRoles;
    const timer: { id?: ReturnType<typeof setTimeout> } = {};
    let ri = 0;
    let ci = roles[0][1].length;
    let deleting = true;
    const loop = () => {
      const [verb, rest] = roles[ri];
      ci += deleting ? -1 : 1;
      this.verb.set(verb);
      this.typed.set(rest.slice(0, ci));
      let wait = deleting ? 28 : 55;
      if (!deleting && ci === rest.length) {
        deleting = true;
        wait = 2200;
      } else if (deleting && ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        wait = 300;
      }
      timer.id = setTimeout(loop, wait);
    };
    timer.id = setTimeout(loop, 2600);
    return timer;
  }

  /** The floating skill chips drift with the cursor (mouse only). */
  private bindChipParallax(host: HTMLElement, motion: MotionService): () => void {
    const me = host.querySelector<HTMLElement>('#me');
    if (!me || !motion.finePointer) return () => undefined;
    const chips = [...me.querySelectorAll<HTMLElement>('[data-depth]')];
    const move = (e: PointerEvent) => {
      const r = me.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      chips.forEach(c => (c.style.transform = `translate(${x * +c.dataset['depth']!}px,${y * +c.dataset['depth']!}px)`));
    };
    const leave = () => chips.forEach(c => (c.style.transform = ''));
    me.addEventListener('pointermove', move);
    me.addEventListener('pointerleave', leave);
    return () => {
      me.removeEventListener('pointermove', move);
      me.removeEventListener('pointerleave', leave);
    };
  }
}
