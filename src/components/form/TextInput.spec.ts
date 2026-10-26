import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { FormTextInput } from './TextInput';

@Component({
  imports: [FormTextInput, FormField],
  template: `
    <app-form-text-input
      label="Nome"
      placeholder="Digite"
      [formField]="userForm.name"
      withAsterisk
    />
  `,
})
class Host {
  readonly model = signal({ name: '' });
  readonly userForm = form(this.model, (path) => required(path.name, { message: 'Obrigatório' }));
}

describe('FormTextInput', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement, input: (fixture.nativeElement as HTMLElement).querySelector('input')! };
  }

  it('links label and input and marks the asterisk', async () => {
    const { element, input } = await render();
    const label = element.querySelector('label')!;

    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.textContent).toContain('*');
  });

  it('writes typed text into the form model', async () => {
    const { fixture, input } = await render();

    input.value = 'Litro';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().name).toBe('Litro');
  });

  it('shows the validation error only after blur', async () => {
    const { fixture, element, input } = await render();

    expect(element.textContent).not.toContain('Obrigatório');

    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(element.textContent).toContain('Obrigatório');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
