import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appFaxNumber]',
  standalone: true
})
export class FaxNumberDirective {

 constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Strip all non-digit characters

    if (value.length > 10) {
      value = value.slice(0, 10); // Max 10 digits
    }

    // Format as (123) 456-7890
    if (value.length > 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    this.control.control?.setValue(value, { emitEvent: false });
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const allowedKeys = /[0-9]/;
    const currentValue = this.control.control?.value?.replace(/\D/g, '') || '';

    if (!allowedKeys.test(event.key) || currentValue.length >= 10) {
      event.preventDefault();
    }
  }

}
