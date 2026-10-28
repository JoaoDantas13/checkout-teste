import { CardBrand, Customer, FailureCode, PaymentMethod, Product } from '../models/payment.models';

export const PRODUCT: Product = {
  id: 'nexo-pro-monthly',
  name: 'Nexo Pro',
  plan: 'Plano mensal · 1 usuário',
  summary: 'Organize projetos, automatize relatórios e conte com suporte prioritário.',
  price: 79.9,
  fees: 0,
  features: ['Projetos e tarefas ilimitados', 'Relatórios e automações', 'Suporte prioritário'],
  renewalNote: 'Renovação mensal. Cancele quando quiser, sem taxas adicionais.',
};

export const CUSTOMER: Customer = {
  name: 'Marina Almeida',
  email: 'marina.almeida@exemplo.com',
};

export const PIX_EXPIRATION_MS = 10 * 60 * 1000;

export const PROCESSING_DELAY_MS = 2200;

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  credit: 'Crédito',
  debit: 'Débito',
  pix: 'Pix',
};

export const BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amex: 'Amex',
  hipercard: 'Hipercard',
  unknown: 'Cartão',
};

export const FAILURE_MESSAGES: Record<FailureCode, { title: string; message: string; hint: string }> = {
  card_declined: {
    title: 'Cartão não autorizado',
    message:
      'Seu banco recusou esta transação. Confira os dados e o limite disponível ou use outro meio de pagamento.',
    hint: 'Você pode pagar com outro cartão ou escolher Pix.',
  },
  insufficient_funds: {
    title: 'Limite ou saldo insuficiente',
    message:
      'O valor da compra é maior que o limite ou saldo disponível neste cartão. Tente outro cartão ou pague com Pix.',
    hint: 'O Pix é aprovado na hora e não depende do limite do cartão.',
  },
  processing_error: {
    title: 'Instabilidade no processamento',
    message:
      'Não conseguimos falar com a operadora do cartão agora. Aguarde alguns instantes e tente novamente.',
    hint: 'Se o problema continuar, escolha outro meio de pagamento.',
  },
  pix_expired: {
    title: 'Código Pix expirado',
    message:
      'O prazo para pagar este código terminou antes da confirmação. Gere um novo código para concluir a compra.',
    hint: 'Um novo código Pix é gerado ao tentar novamente.',
  },
};
