import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appOnlyNumbers]',
  standalone: true
})
export class OnlyNumbersDirective {
   constructor(private control: NgControl) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = (event.target as HTMLInputElement);
    let value = input.value.replace(/\D/g, ''); 

    this.control.control?.setValue(value, { emitEvent: false });
  }
   @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    const allowedKeys = /[0-9]/;
    if (!allowedKeys.test(event.key) || this.control.control?.value?.length >= 10) {
      event.preventDefault();
    }
  }
}
