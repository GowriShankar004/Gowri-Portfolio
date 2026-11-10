import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SectionHead, TextPart } from '../models/portfolio.models';

export interface Word {
  text: string;
  grad: boolean;
  delay: string;
}

/** Splits heading parts into words so each one can rise in on its own beat. */
export function toWords(parts: TextPart[], step = 0.07): Word[] {
  return parts
    .flatMap(p => p.text.split(/\s+/).filter(Boolean).map(text => ({ text, grad: !!p.grad })))
    .map((w, i) => ({ ...w, delay: `${(i * step).toFixed(2)}s` }));
}

/**
 * Eyebrow, word-split heading and lede for a section.
 * Uses an attribute selector so the host stays a plain `.sec-head` div (the projects gallery lays it out as a flex item).
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- an attribute keeps the heading a direct flex/grid item
  selector: '[appSectionHead]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sec-head' },
  template: `
    <span class="eyebrow">{{ head().eyebrow }}</span>
    <h2 [attr.aria-label]="label()">
      @for (w of words(); track $index; let last = $last) {
        <span class="w" aria-hidden="true"><span [class.grad]="w.grad" [style.--d]="w.delay">{{ w.text }}</span></span>{{ last ? '' : ' ' }}
      }
    </h2>
    <p>{{ head().lede }}</p>
  `,
})
export class SectionHeadComponent {
  readonly head = input.required<SectionHead>({ alias: 'appSectionHead' });
  protected readonly words = computed(() => toWords(this.head().title));
  protected readonly label = computed(() => this.head().title.map(p => p.text).join(' '));
}
