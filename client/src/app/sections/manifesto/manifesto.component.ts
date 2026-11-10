import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../../data/portfolio.data';
import { toWords } from '../../shared/section-head.component';

/** A one-paragraph statement whose words light up as you scroll through it. */
@Component({
  selector: 'app-manifesto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host{display:contents}',
  template: `
    <section class="manifesto" aria-label="In short">
      <p class="mf">
        @for (w of words; track $index; let last = $last) {
          <span class="mw" [class.hl]="w.grad">{{ w.text }}</span>{{ last ? '' : ' ' }}
        }
      </p>
      <p class="mf-sign">{{ profile.name }} · {{ profile.location }}</p>
    </section>
  `,
})
export class ManifestoComponent {
  protected readonly profile = PROFILE;
  protected readonly words = toWords(PROFILE.manifesto);
}
