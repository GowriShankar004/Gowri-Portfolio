import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkillGlyph } from '../models/portfolio.models';

export type IconName = SkillGlyph | 'arrow-right' | 'arrow-up' | 'external' | 'moon' | 'github';

/** Inline line icons, drawn with currentColor so they follow the theme. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host{display:contents}',
  template: `
    @switch (name()) {
      @case ('github') {
        <svg [attr.class]="svgClass()" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84c.85 0 1.7.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>
      }
      @default {
        <svg [attr.class]="svgClass()" viewBox="0 0 24 24" fill="none" stroke="currentColor" [attr.stroke-width]="stroke()" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          @switch (name()) {
            @case ('arrow-right') { <path d="M5 12h14M13 6l6 6-6 6"/> }
            @case ('arrow-up') { <path d="M12 19V5M6 11l6-6 6 6"/> }
            @case ('external') { <path d="M7 17 17 7M8 7h9v9"/> }
            @case ('moon') { <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/> }
            @case ('api') { <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1"/> }
            @case ('mail') { <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/> }
            @case ('db') { <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/> }
            @case ('join') { <circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/> }
            @case ('chart') { <path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17V5"/> }
            @case ('spark') { <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 17v4M17 19h4"/> }
            @case ('fn') { <path d="M10 21c2 0 3-1 3.5-3.5L15.5 7C16 4.5 17 3.5 19 3.5M8 11h9"/> }
            @case ('bolt') { <path d="M13 2 3 14h9l-1 8 10-12h-9z"/> }
            @case ('doc') { <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/> }
          }
        </svg>
      }
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly svgClass = input<string | null>(null);
  readonly stroke = input(2.4);
}
