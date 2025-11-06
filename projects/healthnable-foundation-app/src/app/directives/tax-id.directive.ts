import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTaxId]',
  standalone: true
})
export class TaxIdDirective {

    constructor(private control: NgControl) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = (event.target as HTMLInputElement);
    let value = input.value.replace(/\D/g, ''); 

    if (value.length > 2) {
      value = `${value.slice(0, 2)}-${value.slice(2, 9)}`;
    }

    this.control.control?.setValue(value, { emitEvent: false });
  }
   @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    const allowedKeys = /[0-9]/;
    if (!allowedKeys.test(event.key) || this.control.control?.value?.length >= 10) {
      event.preventDefault();
    }
  }
}
