import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PROFILE } from '../../data/portfolio.data';

/** An endless strip of skills; the list is rendered twice so the loop is seamless. */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host{display:contents}',
  template: `
    <div class="marquee" aria-hidden="true">
      <div class="track">
        @for (item of items; track $index) {
          <span [class.hl]="item.strong">{{ item.text }}</span>
        }
      </div>
    </div>
  `,
})
export class MarqueeComponent {
  protected readonly items = [...PROFILE.marquee, ...PROFILE.marquee];
}
