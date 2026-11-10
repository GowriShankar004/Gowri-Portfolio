import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PROFILE } from '../../data/portfolio.data';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { MagneticDirective } from '../../shared/pointer.directives';
import { toWords } from '../../shared/section-head.component';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, ReactiveFormsModule],
  styles: ':host{display:contents}',
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  protected readonly profile = PROFILE;
  protected readonly heading = toWords([{ text: "Let's build something" }, { text: 'intelligent.', grad: true }]);
  protected readonly api = inject(ApiService);
  protected readonly state = signal<FormState>('idle');
  protected readonly serverError = signal('');
  private readonly toast = inject(ToastService);

  /** Mirrors the API's validation so most mistakes are caught before sending. */
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
    website: [''],
  });

  constructor() {
    afterNextRender(() => void this.api.checkHealth());
  }

  /** The first problem with a field, worded for people; shown once the field has been touched. */
  protected fieldError(name: 'name' | 'email' | 'message'): string {
    const c = this.form.controls[name];
    if (!(c.touched || c.dirty) || c.valid) return '';
    if (c.hasError('required')) return { name: 'Enter your name.', email: 'Enter your email.', message: 'Write a message.' }[name];
    if (c.hasError('email')) return 'Enter a valid email address.';
    if (c.hasError('minlength')) return 'Write at least 10 characters.';
    if (c.hasError('maxlength')) return 'That is too long.';
    return c.getError('server') ?? '';
  }

  protected async send(): Promise<void> {
    if (this.state() === 'sending') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.state.set('sending');
    this.serverError.set('');
    const result = await this.api.sendContact(this.form.getRawValue());
    if (result.ok) {
      this.state.set('sent');
      this.form.reset();
      return;
    }
    // Show server-side field errors next to their fields (the API uses PascalCase names).
    for (const [key, messages] of Object.entries(result.fieldErrors ?? {})) {
      const control = this.form.get(key.charAt(0).toLowerCase() + key.slice(1));
      control?.setErrors({ server: messages[0] });
    }
    this.serverError.set(result.message);
    this.state.set('error');
  }

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
