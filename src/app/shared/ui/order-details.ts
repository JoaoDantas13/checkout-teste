import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../core/models/payment.models';
import { ProductBadge } from './product-badge';

export interface DetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-order-details',
  imports: [CurrencyPipe, ProductBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-xl border border-line bg-page/60 p-4 sm:p-5' },
  templateUrl: './order-details.html'})
export class OrderDetails {
  readonly product = input.required<Product>();
  readonly rows = input<DetailRow[]>([]);
  readonly total = input.required<number>();
  readonly totalLabel = input('Total');
}
