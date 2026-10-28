export type PaymentMethod = 'credit' | 'debit' | 'pix';

export type CardMethod = Exclude<PaymentMethod, 'pix'>;

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export type CardBrand = 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'unknown';

export type FailureCode = 'card_declined' | 'insufficient_funds' | 'processing_error' | 'pix_expired';

export interface Product {
  id: string;
  name: string;
  plan: string;
  summary: string;
  price: number;
  fees: number;
  features: string[];
  renewalNote: string;
}

export interface Customer {
  name: string;
  email: string;
}

export interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

export interface CardDraft {
  number: string;
  holder: string;
  expiry: string;
}

export interface PixCharge {
  txid: string;
  payload: string;
  expiresAt: number;
}

export type PaymentRequest =
  | { method: CardMethod; card: CardData }
  | { method: 'pix'; charge: PixCharge };

export interface PaymentAttempt {
  method: PaymentMethod;
  brand?: CardBrand;
  last4?: string;
}

export interface PaymentReceipt {
  orderId: string;
  transactionId: string;
  attempt: PaymentAttempt;
  amount: number;
  paidAt: Date;
  nextRenewal: Date;
}

export interface PaymentFailure {
  code: FailureCode;
  title: string;
  message: string;
  hint: string;
  attempt: PaymentAttempt;
}

export type GatewayResponse =
  | { approved: true; transactionId: string; paidAt: Date }
  | { approved: false; code: FailureCode };
