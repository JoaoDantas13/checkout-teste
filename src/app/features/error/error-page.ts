import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStore } from '../../core/state/payment.store';
import { describeAttempt } from '../../shared/utils/card.utils';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { Icon } from '../../shared/ui/icon';
import { DetailRow, OrderDetails } from '../../shared/ui/order-details';

@Component({
  selector: 'app-error-page',
  imports: [CheckoutSteps, Icon, OrderDetails],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-page.html',
  styleUrl: './error-page.css',
})
export class ErrorPage {
  private readonly router = inject(Router);
  protected readonly store = inject(PaymentStore);

  protected readonly failure = this.store.failure;

  protected readonly rows = computed<DetailRow[]>(() => {
    const failure = this.failure();
    if (!failure) {
      return [];
    }
    return [
      { label: 'Pedido', value: this.store.orderId() },
      { label: 'Meio usado', value: describeAttempt(failure.attempt) },
    ];
  });

  protected retry(): void {
    this.store.retry();
    this.router.navigate(['/pagamento'], { replaceUrl: true });
  }

  protected chooseAnother(): void {
    this.store.chooseAnotherMethod();
    this.router.navigate(['/pagamento'], { replaceUrl: true });
  }
}
