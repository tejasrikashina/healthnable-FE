import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appPincode]',
  standalone: true
})
export class PincodeDirective {

  constructor() { }
 @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const inputChar = event.key;

    const currentValue = (event.target as HTMLInputElement).value;

    const isHyphen = inputChar === '-';
    const alreadyHasHyphen = currentValue.includes('-');

    if (
      allowedKeys.includes(inputChar) ||
      (!isHyphen && /^[0-9]$/.test(inputChar)) ||
      (isHyphen && !alreadyHasHyphen)
    ) {
      return;
    }
     event.preventDefault();
  }
}
