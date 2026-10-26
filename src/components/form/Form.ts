import { Directive, output } from '@angular/core';

/**
 * Todo formulário do projeto usa `<form appForm (submitted)="…">`.
 * Previne o submit nativo do browser e emite `submitted` sem o evento.
 */
@Directive({
  selector: 'form[appForm]',
  host: {
    novalidate: '',
    '(submit)': 'onSubmit($event)',
  },
})
export class Form {
  readonly submitted = output<void>();

  protected onSubmit(event: Event) {
    event.preventDefault();
    this.submitted.emit();
  }
}
