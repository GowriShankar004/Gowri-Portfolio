import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { JOBS, SECTIONS } from '../../data/portfolio.data';
import { SectionHeadComponent } from '../../shared/section-head.component';

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadComponent],
  styles: ':host{display:contents}',
  templateUrl: './experience.component.html',
})
export class ExperienceComponent {
  protected readonly head = SECTIONS.work;
  protected readonly jobs = JOBS;

  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // The timeline line fills as you scroll, lighting each role's dot as it passes the middle of the screen.
    afterNextRender(() => {
      const tl = host.querySelector<HTMLElement>('.tl');
      const fill = host.querySelector<HTMLElement>('.fill');
      if (!tl || !fill) return;
      const jobs = [...tl.querySelectorAll<HTMLElement>('.job')];
      const onScroll = () => {
        const r = tl.getBoundingClientRect();
        const mid = innerHeight * 0.6;
        fill.style.transform = `scaleY(${Math.min(1, Math.max(0, (mid - r.top) / r.height))})`;
        jobs.forEach(j => j.classList.toggle('lit', j.getBoundingClientRect().top < mid));
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      destroyRef.onDestroy(() => removeEventListener('scroll', onScroll));
    });
  }
}
