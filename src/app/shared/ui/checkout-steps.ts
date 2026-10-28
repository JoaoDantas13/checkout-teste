import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from './icon';

type StepState = 'done' | 'current' | 'upcoming';

@Component({
  selector: 'app-checkout-steps',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-steps.html'})
export class CheckoutSteps {
  readonly current = input.required<number>();
  readonly completed = input(false);

  private readonly labels = ['Pedido', 'Pagamento', 'Confirmação'];

  protected readonly steps = computed(() =>
    this.labels.map((label, index) => {
      let state: StepState = 'upcoming';
      if (this.completed() || index < this.current()) {
        state = 'done';
      } else if (index === this.current()) {
        state = 'current';
      }
      return { label, state };
    }),
  );
}
