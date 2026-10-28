import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PaymentStatus } from '../models/payment.models';
import { PaymentStore } from '../state/payment.store';

export function paymentResultGuard(expected: Extract<PaymentStatus, 'success' | 'error'>): CanActivateFn {
  return () => {
    const store = inject(PaymentStore);
    const router = inject(Router);

    const hasData = expected === 'success' ? store.receipt() !== null : store.failure() !== null;
    if (store.status() === expected && hasData) {
      return true;
    }

    store.markRedirected();
    return router.createUrlTree(['/pagamento']);
  };
}
