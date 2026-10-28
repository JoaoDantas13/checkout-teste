import { Routes } from '@angular/router';
import { paymentResultGuard } from './core/guards/payment-result.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pagamento' },
  {
    path: 'pagamento',
    title: 'Pagamento · Nexo',
    loadComponent: () => import('./features/payment/payment-page/payment-page').then((m) => m.PaymentPage),
  },
  {
    path: 'sucesso',
    title: 'Pagamento confirmado · Nexo',
    canActivate: [paymentResultGuard('success')],
    loadComponent: () => import('./features/success/success-page').then((m) => m.SuccessPage),
  },
  {
    path: 'erro',
    title: 'Pagamento não concluído · Nexo',
    canActivate: [paymentResultGuard('error')],
    loadComponent: () => import('./features/error/error-page').then((m) => m.ErrorPage),
  },
  { path: '**', redirectTo: 'pagamento' },
];
