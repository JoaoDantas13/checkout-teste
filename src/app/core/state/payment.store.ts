import { Injectable, computed, inject, signal } from '@angular/core';
import { CUSTOMER, FAILURE_MESSAGES, PIX_EXPIRATION_MS, PRODUCT } from '../data/checkout.mock';
import {
  CardDraft,
  PaymentAttempt,
  PaymentFailure,
  PaymentMethod,
  PaymentReceipt,
  PaymentRequest,
  PaymentStatus,
  PixCharge,
} from '../models/payment.models';
import { PaymentGateway } from '../services/payment-gateway';
import { detectBrand, onlyDigits } from '../../shared/utils/card.utils';

function createOrderId(): string {
  return `#NX-${Math.floor(10000 + Math.random() * 89999)}`;
}

function createPixCharge(orderId: string, amount: number): PixCharge {
  const txid = `NEXO${orderId.replace(/\D/g, '')}${Date.now().toString(36).toUpperCase()}`;
  const value = amount.toFixed(2);
  const payload =
    `00020126580014br.gov.bcb.pix0136nexo-pagamentos-simulado-${txid.slice(-8).toLowerCase()}` +
    `520400005303986540${value.length}${value}5802BR5909NEXO PRO6009SAO PAULO62${String(txid.length + 4).padStart(2, '0')}05${String(txid.length).padStart(2, '0')}${txid}6304A1B2`;
  return { txid, payload, expiresAt: Date.now() + PIX_EXPIRATION_MS };
}

@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly gateway = inject(PaymentGateway);

  readonly product = PRODUCT;
  readonly customer = CUSTOMER;
  readonly total = PRODUCT.price + PRODUCT.fees;

  private readonly state = {
    orderId: signal(createOrderId()),
    method: signal<PaymentMethod>('credit'),
    status: signal<PaymentStatus>('idle'),
    cardDraft: signal<CardDraft | null>(null),
    pixCharge: signal<PixCharge | null>(null),
    attempt: signal<PaymentAttempt | null>(null),
    receipt: signal<PaymentReceipt | null>(null),
    failure: signal<PaymentFailure | null>(null),
    redirected: signal(false),
  };

  readonly orderId = this.state.orderId.asReadonly();
  readonly method = this.state.method.asReadonly();
  readonly status = this.state.status.asReadonly();
  readonly cardDraft = this.state.cardDraft.asReadonly();
  readonly pixCharge = this.state.pixCharge.asReadonly();
  readonly attempt = this.state.attempt.asReadonly();
  readonly receipt = this.state.receipt.asReadonly();
  readonly failure = this.state.failure.asReadonly();
  readonly redirected = this.state.redirected.asReadonly();

  readonly isProcessing = computed(() => this.state.status() === 'processing');

  prepareCheckout(): void {
    const status = this.state.status();
    if (status === 'success') {
      this.startNewOrder();
      return;
    }
    if (status === 'error') {
      this.state.status.set('idle');
      this.state.failure.set(null);
    }
  }

  selectMethod(method: PaymentMethod): void {
    if (this.isProcessing()) {
      return;
    }
    this.state.method.set(method);
    if (method === 'pix') {
      this.ensurePixCharge();
    }
  }

  saveCardDraft(draft: CardDraft): void {
    this.state.cardDraft.set(draft);
  }

  ensurePixCharge(): PixCharge {
    const current = this.state.pixCharge();
    if (current && current.expiresAt > Date.now()) {
      return current;
    }
    return this.renewPixCharge();
  }

  renewPixCharge(): PixCharge {
    const charge = createPixCharge(this.state.orderId(), this.total);
    this.state.pixCharge.set(charge);
    return charge;
  }

  async pay(request: PaymentRequest): Promise<PaymentStatus> {
    if (this.isProcessing()) {
      return 'processing';
    }

    const attempt = this.toAttempt(request);
    this.state.redirected.set(false);
    this.state.attempt.set(attempt);
    this.state.failure.set(null);
    this.state.receipt.set(null);
    this.state.status.set('processing');

    if (request.method !== 'pix') {
      const { cvv, ...draft } = request.card;
      this.state.cardDraft.set(draft);
    }

    const response = await this.gateway.process(request);

    if (response.approved) {
      const nextRenewal = new Date(response.paidAt);
      nextRenewal.setMonth(nextRenewal.getMonth() + 1);
      this.state.receipt.set({
        orderId: this.state.orderId(),
        transactionId: response.transactionId,
        attempt,
        amount: this.total,
        paidAt: response.paidAt,
        nextRenewal,
      });
      this.state.status.set('success');
    } else {
      this.state.failure.set({ code: response.code, ...FAILURE_MESSAGES[response.code], attempt });
      this.state.status.set('error');
    }

    return this.state.status();
  }

  retry(): void {
    const failure = this.state.failure();
    if (failure?.attempt.method) {
      this.state.method.set(failure.attempt.method);
    }
    if (failure?.code === 'pix_expired') {
      this.renewPixCharge();
    }
    this.state.status.set('idle');
    this.state.failure.set(null);
  }

  chooseAnotherMethod(): void {
    const failed = this.state.failure()?.attempt.method;
    this.state.status.set('idle');
    this.state.failure.set(null);
    if (failed === 'pix') {
      this.state.method.set('credit');
    } else {
      this.state.method.set('pix');
      this.ensurePixCharge();
    }
  }

  startNewOrder(): void {
    this.state.orderId.set(createOrderId());
    this.state.method.set('credit');
    this.state.status.set('idle');
    this.state.cardDraft.set(null);
    this.state.pixCharge.set(null);
    this.state.attempt.set(null);
    this.state.receipt.set(null);
    this.state.failure.set(null);
  }

  markRedirected(): void {
    this.state.redirected.set(true);
  }

  dismissRedirectNotice(): void {
    this.state.redirected.set(false);
  }

  private toAttempt(request: PaymentRequest): PaymentAttempt {
    if (request.method === 'pix') {
      return { method: 'pix' };
    }
    const digits = onlyDigits(request.card.number);
    return { method: request.method, brand: detectBrand(digits), last4: digits.slice(-4) };
  }
}
