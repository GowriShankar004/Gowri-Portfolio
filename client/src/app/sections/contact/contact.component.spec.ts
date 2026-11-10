import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../core/api.service';
import { ContactComponent } from './contact.component';

async function render(contactAvailable: boolean) {
  await TestBed.configureTestingModule({ imports: [ContactComponent] }).compileComponents();
  const api = TestBed.inject(ApiService);
  api.contactAvailable.set(contactAvailable);
  const sendContact = vi.spyOn(api, 'sendContact').mockResolvedValue({ ok: true });
  const fixture = TestBed.createComponent(ContactComponent);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement, sendContact };
}

function type(el: HTMLElement, selector: string, value: string) {
  const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

afterEach(() => TestBed.resetTestingModule());

describe('ContactComponent', () => {
  it('shows only the copy-email option when the API cannot send email', async () => {
    const { el } = await render(false);
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('.mail code')?.textContent).toContain('@');
  });

  it('does not send an incomplete message and says what is missing', async () => {
    const { fixture, el, sendContact } = await render(true);
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(sendContact).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Enter your name.');
    expect(el.textContent).toContain('Enter your email.');
  });

  it('sends a valid message and confirms it', async () => {
    const { fixture, el, sendContact } = await render(true);
    type(el, 'input[formcontrolname=name]', 'Asha Rao');
    type(el, 'input[formcontrolname=email]', 'asha@company.com');
    type(el, 'textarea', "We're hiring an Angular developer.");
    el.querySelector<HTMLButtonElement>('button[type=submit]')!.click();
    await fixture.whenStable();

    expect(sendContact).toHaveBeenCalledWith({ name: 'Asha Rao', email: 'asha@company.com', message: "We're hiring an Angular developer.", website: '' });
    expect(el.textContent).toContain('Message sent.');
  });
});
