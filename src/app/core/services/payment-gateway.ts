import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PROCESSING_DELAY_MS } from '../data/checkout.mock';
import { FailureCode, GatewayResponse, PaymentRequest } from '../models/payment.models';
import { onlyDigits } from '../../shared/utils/card.utils';

interface TestCard {
  number: string;
  outcome: FailureCode | 'approved';
}

@Injectable({ providedIn: 'root' })
export class PaymentGateway {
  private readonly http = inject(HttpClient);

  async process(request: PaymentRequest, delay = PROCESSING_DELAY_MS): Promise<GatewayResponse> {
    const startedAt = Date.now();
    const response = await this.evaluate(request);
    await this.waitRemaining(startedAt, delay);
    return response;
  }

  private async evaluate(request: PaymentRequest): Promise<GatewayResponse> {
    if (request.method === 'pix') {
      if (Date.now() > request.charge.expiresAt) {
        return { approved: false, code: 'pix_expired' };
      }
      return this.approve(request.method);
    }

    const digits = onlyDigits(request.card.number);
    const matches = await firstValueFrom(
      this.http.get<TestCard[]>(`${environment.apiUrl}/cards`, { params: { number: digits } }),
    );

    const testCard = matches[0];
    if (testCard && testCard.outcome !== 'approved') {
      return { approved: false, code: testCard.outcome };
    }
    return this.approve(request.method);
  }

  private async approve(method: PaymentRequest['method']): Promise<GatewayResponse> {
    const transactionId = `TX${Date.now().toString(36).toUpperCase()}`;
    const paidAt = new Date();
    await firstValueFrom(this.http.post(`${environment.apiUrl}/transactions`, { transactionId, method, paidAt }));
    return { approved: true, transactionId, paidAt };
  }

  private waitRemaining(startedAt: number, delay: number): Promise<void> {
    const remaining = delay - (Date.now() - startedAt);
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, remaining)));
  }
}
