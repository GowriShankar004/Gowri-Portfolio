import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PROJECTS, SECTIONS } from '../../data/portfolio.data';
import { IconComponent } from '../../shared/icons.component';
import { SpotlightDirective } from '../../shared/pointer.directives';
import { SectionHeadComponent } from '../../shared/section-head.component';

/**
 * On large screens the motion layer pins this section and slides the track sideways
 * (see core/choreography.ts); on phones it is a normal vertical list.
 */
@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, SectionHeadComponent, IconComponent, SpotlightDirective],
  styles: ':host{display:contents}',
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  protected readonly head = SECTIONS.projects;
  protected readonly projects = PROJECTS;
}
