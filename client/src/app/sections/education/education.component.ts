import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EDUCATION, SECTIONS } from '../../data/portfolio.data';
import { SectionHeadComponent } from '../../shared/section-head.component';

@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadComponent],
  styles: ':host{display:contents}',
  template: `
    <section id="education" class="ghosted">
      <span class="ghost" aria-hidden="true">05</span>
      <div class="rv" [appSectionHead]="head"></div>
      <div class="edu">
        @for (e of education; track e.title) {
          <div class="ed rv">
            <span class="yr">{{ e.years }}</span>
            <h3>{{ e.title }}</h3>
            <p class="deg">{{ e.field }}</p>
            <p>{{ e.school }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class EducationComponent {
  protected readonly head = SECTIONS.education;
  protected readonly education = EDUCATION;
}
