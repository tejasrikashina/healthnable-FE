import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export function allowOnlyHyphens(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    // if (!control.value) {
    //   return null;
    // }
    const value = control.value
    if (value === null || value === undefined || typeof value !== 'string') {
      return null; 
    }
    const isValid = validateSpecialCharacterSpacing(value);
    return isValid ? null : { 'allowonlyhyphens': true }
  };
}
function validateSpecialCharacterSpacing(input: string): boolean {
  const specialChars = ['-'];
  let lastWasSpecial = false;

  if (input.endsWith(' ')) {
    return false; 
  }

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (specialChars.includes(char)) {
      if (i === input.length - 1) {
        return true;
      }

      if (input[i + 1] === ' ') {
        if (i + 2 >= input.length || input[i + 2] === ' ') {
          return false;
        }
      } else if (specialChars.includes(input[i + 1])) {
        continue;
      } else if (!/[A-Za-z0-9]/.test(input[i + 1])) {
        return false;
      }

      lastWasSpecial = true;
    } else if (char === ' ') {
      if (i > 0 && input[i - 1] === ' ') {
        return false;
      }
    } else if (!/[A-Za-z0-9\s]/.test(char)) {
      return false;
    }
  }

  return true;
}