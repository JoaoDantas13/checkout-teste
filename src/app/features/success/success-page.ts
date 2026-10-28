import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStore } from '../../core/state/payment.store';
import { describeAttempt } from '../../shared/utils/card.utils';
import { CheckoutSteps } from '../../shared/ui/checkout-steps';
import { Icon } from '../../shared/ui/icon';
import { DetailRow, OrderDetails } from '../../shared/ui/order-details';

@Component({
  selector: 'app-success-page',
  imports: [DatePipe, CheckoutSteps, Icon, OrderDetails],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './success-page.html'})
export class SuccessPage {
  private readonly router = inject(Router);
  protected readonly store = inject(PaymentStore);

  protected readonly receipt = this.store.receipt;
  protected readonly firstName = this.store.customer.name.split(' ')[0];

  private readonly datePipe = new DatePipe('pt-BR');

  protected readonly rows = computed<DetailRow[]>(() => {
    const receipt = this.receipt();
    if (!receipt) {
      return [];
    }
    return [
      { label: 'Pedido', value: receipt.orderId },
      { label: 'Pagamento', value: describeAttempt(receipt.attempt) },
      { label: 'Data', value: this.datePipe.transform(receipt.paidAt, "dd/MM/yyyy, HH:mm") ?? '' },
      { label: 'Transação', value: receipt.transactionId },
    ];
  });

  protected openWorkspace(): void {
    this.store.startNewOrder();
    this.router.navigate(['/pagamento']);
  }

  protected printReceipt(): void {
    window.print();
  }
}
