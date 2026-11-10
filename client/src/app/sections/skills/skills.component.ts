import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ROADMAP, SECTIONS, SKILL_GROUPS } from '../../data/portfolio.data';
import { IconComponent } from '../../shared/icons.component';
import { SectionHeadComponent } from '../../shared/section-head.component';

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadComponent, IconComponent],
  styles: ':host{display:contents}',
  templateUrl: './skills.component.html',
})
export class SkillsComponent {
  protected readonly head = SECTIONS.skills;
  protected readonly groups = SKILL_GROUPS;
  protected readonly roadmap = ROADMAP;

  /** Gradient swatch for the AI group; the rest use their own colour. */
  protected swatch(name: string, color: string): string {
    return name === 'AI and Python' ? 'linear-gradient(135deg,var(--mint),var(--violet))' : color;
  }
}
