import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { cardNumberLength, cvvLength, detectBrand, onlyDigits, passesLuhn } from '../utils/card.utils';

export const cardNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const digits = onlyDigits(control.value);
  if (!digits) {
    return null;
  }

  const brand = detectBrand(digits);
  if (!cardNumberLength(brand).includes(digits.length)) {
    return { cardLength: true };
  }
  return passesLuhn(digits) ? null : { cardNumber: true };
};

export const holderNameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  const parts = value.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length < 2 || parts[0].length < 2 || parts[parts.length - 1].length < 2) {
    return { holderName: true };
  }
  return value.length > 26 ? { holderTooLong: true } : null;
};

export function expiryValidator(today: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digits = onlyDigits(control.value);
    if (!digits) {
      return null;
    }
    if (digits.length !== 4) {
      return { expiryFormat: true };
    }

    const month = Number(digits.slice(0, 2));
    const year = 2000 + Number(digits.slice(2));
    if (month < 1 || month > 12) {
      return { expiryFormat: true };
    }

    const now = today();
    const currentMonth = now.getFullYear() * 12 + now.getMonth();
    const cardMonth = year * 12 + (month - 1);

    if (cardMonth < currentMonth) {
      return { expired: true };
    }
    return cardMonth - currentMonth > 20 * 12 ? { expiryFormat: true } : null;
  };
}

export const cvvValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const digits = onlyDigits(control.value);
  if (!digits) {
    return null;
  }

  const number = control.parent?.get('number')?.value ?? '';
  const expected = cvvLength(detectBrand(number));
  return digits.length === expected ? null : { cvv: { expected } };
};
