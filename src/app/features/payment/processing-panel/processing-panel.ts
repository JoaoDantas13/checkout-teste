import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../core/models/payment.models';
import { Icon } from '../../../shared/ui/icon';
import { ProductBadge } from '../../../shared/ui/product-badge';

@Component({
  selector: 'app-processing-panel',
  imports: [CurrencyPipe, Icon, ProductBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './processing-panel.html',
})
export class ProcessingPanel {
  readonly product = input.required<Product>();
  readonly amount = input.required<number>();
  readonly methodLabel = input.required<string>();
}
