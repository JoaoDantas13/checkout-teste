import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { BRAND_LABELS, METHOD_LABELS } from '../../../core/data/checkout.mock';
import { CardData, CardDraft, CardMethod } from '../../../core/models/payment.models';
import {
  cvvLength,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  formatHolder,
  onlyDigits,
} from '../../../shared/utils/card.utils';
import {
  cardNumberValidator,
  cvvValidator,
  expiryValidator,
  holderNameValidator,
} from '../../../shared/validators/card.validators';
import { Icon } from '../../../shared/ui/icon';

type CardField = 'number' | 'holder' | 'expiry' | 'cvv';

type CardFormGroup = FormGroup<Record<CardField, FormControl<string>>>;

@Component({
  selector: 'app-card-form',
  imports: [ReactiveFormsModule, CurrencyPipe, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-form.html'})
export class CardForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly method = input.required<CardMethod>();
  readonly amount = input.required<number>();
  readonly draft = input<CardDraft | null>(null);
  readonly disabled = input(false);

  readonly submitted = output<CardData>();
  readonly draftChange = output<CardDraft>();

  protected readonly form: CardFormGroup = this.fb.group({
    number: ['', [Validators.required, cardNumberValidator]],
    holder: ['', [Validators.required, holderNameValidator]],
    expiry: ['', [Validators.required, expiryValidator()]],
    cvv: ['', [Validators.required, cvvValidator]],
  });

  protected readonly attempted = signal(false);

  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  private readonly numberValue = toSignal(this.form.controls.number.valueChanges, { initialValue: '' });

  protected readonly brand = computed(() => detectBrand(this.numberValue()));
  protected readonly brandLabel = computed(() => BRAND_LABELS[this.brand()]);
  protected readonly cvvSize = computed(() => cvvLength(this.brand()));
  protected readonly title = computed(() => `Cartão de ${METHOD_LABELS[this.method()].toLowerCase()}`);
  protected readonly isValid = computed(() => this.status() === 'VALID');
  protected readonly showBlocked = computed(() => this.attempted() && !this.isValid());

  protected readonly fieldIds: Record<CardField, string> = {
    number: 'card-number',
    holder: 'card-holder',
    expiry: 'card-expiry',
    cvv: 'card-cvv',
  };

  ngOnInit(): void {
    const draft = this.draft();
    if (draft) {
      this.form.patchValue({
        number: formatCardNumber(draft.number),
        holder: draft.holder,
        expiry: draft.expiry,
      });
      this.form.controls.number.markAsTouched();
      this.form.controls.holder.markAsTouched();
      this.form.controls.expiry.markAsTouched();
    }

    this.form.controls.number.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.controls.cvv.updateValueAndValidity({ emitEvent: false });
    });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const { number, holder, expiry } = this.form.getRawValue();
      this.draftChange.emit({ number: onlyDigits(number), holder: holder.trim(), expiry });
    });
  }

  protected mask(field: CardField): void {
    const control = this.form.controls[field];
    const formatters: Record<CardField, (value: string) => string> = {
      number: formatCardNumber,
      holder: formatHolder,
      expiry: formatExpiry,
      cvv: (value) => onlyDigits(value).slice(0, 4),
    };
    const formatted = formatters[field](control.value);
    if (formatted !== control.value) {
      control.setValue(formatted);
    }
  }

  protected hasError(field: CardField): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.attempted());
  }

  protected errorMessage(field: CardField): string {
    const errors = this.form.controls[field].errors ?? {};
    return this.messageFor(field, errors);
  }

  protected submit(): void {
    if (this.disabled()) {
      return;
    }
    this.attempted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const { number, holder, expiry, cvv } = this.form.getRawValue();
    this.submitted.emit({ number: onlyDigits(number), holder: holder.trim(), expiry, cvv });
  }

  private focusFirstInvalid(): void {
    const order: CardField[] = ['number', 'holder', 'expiry', 'cvv'];
    const field = order.find((name) => this.form.controls[name].invalid);
    if (field) {
      this.host.nativeElement.querySelector<HTMLInputElement>(`#${this.fieldIds[field]}`)?.focus();
    }
  }

  private messageFor(field: CardField, errors: ValidationErrors): string {
    if (errors['required']) {
      return {
        number: 'Informe o número do cartão.',
        holder: 'Informe o nome como aparece no cartão.',
        expiry: 'Informe a validade.',
        cvv: 'Informe o CVV.',
      }[field];
    }

    switch (field) {
      case 'number':
        return errors['cardLength']
          ? 'Número incompleto. Confira os dígitos do cartão.'
          : 'Número inválido. Confira os dígitos do cartão.';
      case 'holder':
        return errors['holderTooLong']
          ? 'Use no máximo 26 caracteres, como impresso no cartão.'
          : 'Informe o nome completo, como aparece no cartão.';
      case 'expiry':
        return errors['expired'] ? 'Cartão vencido.' : 'Use o formato MM/AA.';
      case 'cvv':
        return `Use ${this.cvvSize()} dígitos.`;
    }
  }
}
