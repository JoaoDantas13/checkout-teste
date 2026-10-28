import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PaymentMethod } from '../../../core/models/payment.models';
import { Icon, IconName } from '../../../shared/ui/icon';

interface MethodOption {
  value: PaymentMethod;
  label: string;
  caption: string;
  icon: IconName;
}

@Component({
  selector: 'app-method-selector',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './method-selector.html',
})
export class MethodSelector {
  readonly selected = input.required<PaymentMethod>();
  readonly disabled = input(false);
  readonly changed = output<PaymentMethod>();

  protected readonly options: MethodOption[] = [
    { value: 'credit', label: 'Crédito', caption: 'Visa, Master, Elo', icon: 'card' },
    { value: 'debit', label: 'Débito', caption: 'Débito à vista', icon: 'card' },
    { value: 'pix', label: 'Pix', caption: 'Aprovação na hora', icon: 'pix' },
  ];

  protected select(method: PaymentMethod): void {
    if (method !== this.selected()) {
      this.changed.emit(method);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(event.key) || this.disabled()) {
      return;
    }
    event.preventDefault();
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const index = this.options.findIndex((option) => option.value === this.selected());
    const next = this.options[(index + step + this.options.length) % this.options.length];
    this.changed.emit(next.value);

    const group = event.currentTarget as HTMLElement;
    setTimeout(() => group.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
  }
}
