import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../core/models/payment.models';

@Component({
  selector: 'app-product-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-3' },
  templateUrl: './product-badge.html'})
export class ProductBadge {
  readonly product = input.required<Product>();
}
