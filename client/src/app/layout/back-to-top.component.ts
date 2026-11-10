import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { NavigationService } from '../core/navigation.service';
import { IconComponent } from '../shared/icons.component';

/** Appears after the first screen; its ring fills with scroll progress. */
@Component({
  selector: 'app-back-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  styles: ':host{display:contents}',
  template: `
    <a class="totop" [class.show]="visible()" href="#top" aria-label="Back to top" (click)="go($event)">
      <svg class="ring" viewBox="0 0 54 54" aria-hidden="true">
        <circle cx="27" cy="27" r="25" pathLength="100" stroke-dasharray="100" [attr.stroke-dashoffset]="offset()" />
      </svg>
      <app-icon name="arrow-up" svgClass="arr" />
    </a>
  `,
})
export class BackToTopComponent {
  protected readonly visible = signal(false);
  protected readonly offset = signal(100);
  private readonly nav = inject(NavigationService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        const p = h > 0 ? scrollY / h : 0;
        this.visible.set(scrollY > innerHeight * 0.8);
        this.offset.set(Math.round(100 - p * 100));
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      destroyRef.onDestroy(() => removeEventListener('scroll', onScroll));
    });
  }

  protected go(event: Event): void {
    if (this.nav.travel('top')) event.preventDefault();
  }
}
