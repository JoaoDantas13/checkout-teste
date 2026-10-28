import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CardData, CardDraft, PaymentMethod } from '../../../core/models/payment.models';
import { PaymentStore } from '../../../core/state/payment.store';
import { describeAttempt } from '../../../shared/utils/card.utils';
import { CheckoutSteps } from '../../../shared/ui/checkout-steps';
import { Icon } from '../../../shared/ui/icon';
import { CardForm } from '../card-form/card-form';
import { MethodSelector } from '../method-selector/method-selector';
import { OrderSummary } from '../order-summary/order-summary';
import { PixPanel } from '../pix-panel/pix-panel';
import { ProcessingPanel } from '../processing-panel/processing-panel';

@Component({
  selector: 'app-payment-page',
  imports: [CheckoutSteps, Icon, CardForm, MethodSelector, OrderSummary, PixPanel, ProcessingPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-page.html'})
export class PaymentPage implements OnInit {
  private readonly router = inject(Router);
  protected readonly store = inject(PaymentStore);

  protected readonly method = this.store.method;
  protected readonly processing = this.store.isProcessing;
  protected readonly attemptLabel = computed(() => {
    const attempt = this.store.attempt();
    return attempt ? describeAttempt(attempt) : '';
  });

  ngOnInit(): void {
    this.store.prepareCheckout();
    if (this.store.method() === 'pix') {
      this.store.ensurePixCharge();
    }
  }

  protected selectMethod(method: PaymentMethod): void {
    this.store.selectMethod(method);
  }

  protected saveDraft(draft: CardDraft): void {
    this.store.saveCardDraft(draft);
  }

  protected async payWithCard(card: CardData): Promise<void> {
    const method = this.method();
    if (method === 'pix') {
      return;
    }
    await this.finish(this.store.pay({ method, card }));
  }

  protected async payWithPix(): Promise<void> {
    const charge = this.store.pixCharge() ?? this.store.ensurePixCharge();
    await this.finish(this.store.pay({ method: 'pix', charge }));
  }

  protected renewPix(): void {
    this.store.renewPixCharge();
  }

  private async finish(result: Promise<string>): Promise<void> {
    const status = await result;
    if (status === 'success') {
      await this.router.navigate(['/sucesso'], { replaceUrl: true });
    } else if (status === 'error') {
      await this.router.navigate(['/erro']);
    }
  }
}
