import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toDataURL } from 'qrcode';
import { PixCharge } from '../../../core/models/payment.models';
import { Icon } from '../../../shared/ui/icon';

@Component({
  selector: 'app-pix-panel',
  imports: [CurrencyPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pix-panel.html'})
export class PixPanel {
  readonly charge = input.required<PixCharge>();
  readonly amount = input.required<number>();
  readonly disabled = input(false);

  readonly conclude = output<void>();
  readonly regenerate = output<void>();

  protected readonly qrCode = signal<string | null>(null);
  protected readonly copied = signal(false);

  private readonly now = signal(Date.now());
  private copiedTimer?: ReturnType<typeof setTimeout>;

  protected readonly secondsLeft = computed(() =>
    Math.max(0, Math.ceil((this.charge().expiresAt - this.now()) / 1000)),
  );
  protected readonly expired = computed(() => this.secondsLeft() === 0);
  protected readonly remaining = computed(() => {
    const total = this.secondsLeft();
    const minutes = Math.floor(total / 60);
    const seconds = String(total % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  constructor() {
    const ticker = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(ticker);
      clearTimeout(this.copiedTimer);
    });

    effect(() => {
      const payload = this.charge().payload;
      this.qrCode.set(null);
      toDataURL(payload, { margin: 1, width: 352, color: { dark: '#1d1d2b', light: '#ffffff' } })
        .then((url) => {
          if (this.charge().payload === payload) {
            this.qrCode.set(url);
          }
        })
        .catch(() => this.qrCode.set(null));
    });
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.charge().payload);
    } catch {
      const field = document.getElementById('pix-code') as HTMLInputElement | null;
      field?.select();
      document.execCommand?.('copy');
    }
    this.copied.set(true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(false), 2500);
  }

  protected selectAll(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }
}
