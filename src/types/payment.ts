// src/types/payment.ts
// Чистые TypeScript-типы для модуля умной оплаты с гео-маршрутизацией

export type PaymentRegion = 'RU' | 'CIS_INTL';

export type PaymentMethodId =
  // RU методы (ЮKassa маршрут)
  | 'sbp'
  | 'sberpay'
  | 'tpay'
  | 'card_ru'
  // CIS / Международные методы (Robokassa маршрут)
  | 'card_intl'
  | 'wallets';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  iconType: 'sbp' | 'sberpay' | 'tpay' | 'card' | 'globe' | 'wallet';
  popular?: boolean;
}

export interface SmartPaymentInitRequest {
  amount: number;
  description: string;
  type?: 'donation' | 'course' | 'estimate' | 'service';
  targetId?: string;
  email?: string;
  phone?: string;
  userUid?: string;
  userName?: string;
  countryCode?: string;
  paymentMethodId?: PaymentMethodId;
  returnUrl?: string;
}

export interface SmartPaymentInitResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  gatewayUsed?: 'yookassa' | 'robokassa';
  isFailover?: boolean;
  error?: string;
}
