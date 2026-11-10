import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PROFILE } from '../../data/portfolio.data';
import { ToastService } from '../../core/toast.service';
import { MagneticDirective } from '../../shared/pointer.directives';
import { toWords } from '../../shared/section-head.component';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective],
  styles: ':host{display:contents}',
  template: `
    <section class="contact rv" id="contact">
      <span class="eyebrow">Contact</span>
      <h2 style="margin-top:16px" aria-label="Let's build something intelligent.">
        @for (w of heading; track $index; let last = $last) {
          <span class="w" aria-hidden="true"><span [class.grad]="w.grad">{{ w.text }}</span></span>{{ last ? '' : ' ' }}
        }
      </h2>
      <p>Open to collaborating on full-stack and AI projects, and to conversations about opportunities. Drop me a line.</p>
      <div class="mail">
        <code #email>{{ profile.email }}</code>
        <button class="btn primary" type="button" (click)="copy(email)">Copy email</button>
      </div>
      <div class="socials">
        <a class="btn mag" appMagnetic [href]="profile.linkedin" target="_blank" rel="noopener">LinkedIn</a>
        <a class="btn mag" appMagnetic [href]="profile.github" target="_blank" rel="noopener">GitHub</a>
      </div>
    </section>
  `,
})
export class ContactComponent {
  protected readonly profile = PROFILE;
  protected readonly heading = toWords([{ text: "Let's build something" }, { text: 'intelligent.', grad: true }]);
  private readonly toast = inject(ToastService);

  /** Copies the address; where the clipboard is blocked it selects the text instead. */
  protected copy(el: HTMLElement): void {
    const select = () => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      this.toast.show('Email selected. Press Ctrl+C to copy');
    };
    try {
      navigator.clipboard.writeText(this.profile.email).then(() => this.toast.show('Email copied'), select);
    } catch {
      select();
    }
  }
}
