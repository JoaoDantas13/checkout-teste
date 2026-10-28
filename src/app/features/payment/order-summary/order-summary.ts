import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../core/models/payment.models';
import { Icon } from '../../../shared/ui/icon';
import { ProductBadge } from '../../../shared/ui/product-badge';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, Icon, ProductBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './order-summary.html'})
export class OrderSummary {
  readonly product = input.required<Product>();
  readonly total = input.required<number>();
}
