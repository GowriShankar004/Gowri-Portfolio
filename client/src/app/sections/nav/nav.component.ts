import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { NavigationService, SectionId } from '../../core/navigation.service';
import { ThemeService } from '../../core/theme.service';
import { IconComponent } from '../../shared/icons.component';

interface NavLink {
  id: SectionId;
  label: string;
}

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  styles: ':host{display:contents}',
  templateUrl: './nav.component.html',
})
export class NavComponent {
  private readonly nav = inject(NavigationService);
  protected readonly theme = inject(ThemeService);

  protected readonly links: NavLink[] = [
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ];
  protected readonly scrolled = signal(false);
  protected readonly active = signal<SectionId | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => {
        this.scrolled.set(scrollY > 10);
        let current: SectionId | null = null;
        for (const link of this.links) {
          const el = document.getElementById(link.id);
          if (el && el.getBoundingClientRect().top < 140) current = link.id;
        }
        this.active.set(current);
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      destroyRef.onDestroy(() => removeEventListener('scroll', onScroll));
    });
  }

  protected go(event: Event, id: SectionId): void {
    if (this.nav.travel(id)) event.preventDefault();
  }
}
