import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { setupChoreography } from '../../core/choreography';
import { MotionService } from '../../core/motion.service';
import { ThemeService } from '../../core/theme.service';
import { AmbientComponent } from '../../layout/ambient.component';
import { BackToTopComponent } from '../../layout/back-to-top.component';
import { CurtainComponent } from '../../layout/curtain.component';
import { ToastComponent } from '../../layout/toast.component';
import { AboutComponent } from '../../sections/about/about.component';
import { ContactComponent } from '../../sections/contact/contact.component';
import { EducationComponent } from '../../sections/education/education.component';
import { ExperienceComponent } from '../../sections/experience/experience.component';
import { HeroComponent } from '../../sections/hero/hero.component';
import { ManifestoComponent } from '../../sections/manifesto/manifesto.component';
import { MarqueeComponent } from '../../sections/marquee/marquee.component';
import { NavComponent } from '../../sections/nav/nav.component';
import { ProjectsComponent } from '../../sections/projects/projects.component';
import { SkillsComponent } from '../../sections/skills/skills.component';
import { PROFILE } from '../../data/portfolio.data';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AmbientComponent, NavComponent, HeroComponent, MarqueeComponent, ManifestoComponent, AboutComponent,
    ExperienceComponent, ProjectsComponent, SkillsComponent, EducationComponent, ContactComponent,
    ToastComponent, CurtainComponent, BackToTopComponent,
  ],
  styles: ':host{display:contents}',
  template: `
    <app-ambient />
    <app-nav />
    <main class="wrap" id="top">
      <app-hero />
      <app-marquee />
      <app-manifesto />
      <app-about />
      <app-experience />
      <app-projects />
      <app-skills />
      <app-education />
      <app-contact />
      <footer><span>© {{ year }} {{ name }}</span><span>Visakhapatnam · Hyderabad, India</span></footer>
    </main>
    <app-toast />
    <app-curtain />
    <app-back-to-top />
  `,
})
export class HomePage {
  protected readonly year = new Date().getFullYear();
  protected readonly name = PROFILE.name;

  constructor() {
    const motion = inject(MotionService);
    const theme = inject(ThemeService);
    const destroyRef = inject(DestroyRef);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // Motion starts after the whole page has rendered in the browser; the prerendered HTML never depends on it.
    afterNextRender(() => {
      theme.restore();
      motion.start();
      if (!motion.enabled) return;
      const teardown = setupChoreography(host);
      destroyRef.onDestroy(() => {
        teardown();
        motion.destroy();
      });
    });
  }
}
