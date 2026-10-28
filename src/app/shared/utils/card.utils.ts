import { BRAND_LABELS, METHOD_LABELS } from '../../core/data/checkout.mock';
import { CardBrand, PaymentAttempt } from '../../core/models/payment.models';

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function detectBrand(value: string): CardBrand {
  const digits = onlyDigits(value);

  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(digits)) {
    return 'elo';
  }
  if (/^(606282|3841)/.test(digits)) {
    return 'hipercard';
  }
  if (/^3[47]/.test(digits)) {
    return 'amex';
  }
  if (/^4/.test(digits)) {
    return 'visa';
  }
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return 'mastercard';
  }
  return 'unknown';
}

export function cardNumberLength(brand: CardBrand): number[] {
  if (brand === 'amex') {
    return [15];
  }
  if (brand === 'hipercard') {
    return [13, 16, 19];
  }
  return brand === 'unknown' ? [13, 14, 15, 16, 17, 18, 19] : [16];
}

export function cvvLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3;
}

export function formatCardNumber(value: string): string {
  const brand = detectBrand(value);
  const digits = onlyDigits(value).slice(0, Math.max(...cardNumberLength(brand)));

  if (brand === 'amex') {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10)].filter(Boolean).join(' ');
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function formatHolder(value: string): string {
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' ]/g, '').replace(/\s{2,}/g, ' ').toUpperCase();
}

export function passesLuhn(value: string): boolean {
  const digits = onlyDigits(value);
  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

export function describeAttempt(attempt: PaymentAttempt): string {
  const method = METHOD_LABELS[attempt.method];
  if (attempt.method === 'pix') {
    return method;
  }
  const brand = BRAND_LABELS[attempt.brand ?? 'unknown'];
  return `${method} · ${brand} •••• ${attempt.last4 ?? ''}`.trim();
}
