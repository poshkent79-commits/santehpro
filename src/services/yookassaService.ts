// src/services/yookassaService.ts
// Официальная интеграция с платёжным шлюзом ЮKassa (ООО НКО «ЮМани»)
// Поддержка банковских карт МИР/Visa/MasterCard, СБП (QR-код), SberPay, T-Pay, ЮMoney

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface YooKassaConfig {
  shopId: string;
  secretKey: string;
  enabled: boolean;
  returnUrl: string;
}

export interface CreateYooKassaPaymentOptions {
  amount: number;
  description: string;
  email?: string;
  phone?: string;
  type?: 'donation' | 'course' | 'estimate' | 'service';
  targetId?: string;
  userUid?: string;
  userName?: string;
  returnUrl?: string;
}

export interface YooKassaPaymentRecord {
  id: string;
  paymentId: string;
  amount: number;
  description: string;
  type: string;
  targetId?: string;
  userUid?: string;
  userEmail?: string;
  userName?: string;
  status: 'pending' | 'succeeded' | 'canceled';
  paymentDate?: string;
  createdAt: string;
  confirmationUrl?: string;
  rawPayload?: any;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const CONFIG_FILE = path.join(DATA_DIR, 'yookassa_config.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'yookassa_payments.json');

// Конфигурация по умолчанию с одобренными реквизитами
const DEFAULT_CONFIG: YooKassaConfig = {
  shopId: process.env.YOOKASSA_SHOP_ID || '1486303',
  secretKey: process.env.YOOKASSA_SECRET_KEY || 'live_RBZU9UEZTLf-mC9TufIpYZ5P4_w2TAVALCuS19FQKII',
  enabled: true,
  returnUrl: 'https://santehpro.info/?payment=success',
};

export function getYooKassaConfig(): YooKassaConfig {
  let cfg = { ...DEFAULT_CONFIG };
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      cfg = { ...cfg, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to read yookassa_config.json, using defaults:', err);
  }
  return cfg;
}

export function saveYooKassaConfig(config: Partial<YooKassaConfig>): YooKassaConfig {
  const current = getYooKassaConfig();
  const updated: YooKassaConfig = { ...current, ...config };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save yookassa config:', err);
  }
  return updated;
}

export function getYooKassaPaymentsHistory(): YooKassaPaymentRecord[] {
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to read yookassa payments history:', err);
  }
  return [];
}

export function saveYooKassaPaymentRecord(record: YooKassaPaymentRecord) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const history = getYooKassaPaymentsHistory();
    const idx = history.findIndex((p) => p.paymentId === record.paymentId);
    if (idx >= 0) {
      history[idx] = record;
    } else {
      history.unshift(record);
    }
    // Keep last 500 payments
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(history.slice(0, 500), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save yookassa payment record:', err);
  }
}

/**
 * Создание платежа через официальный REST API v3 ЮKassa
 */
export async function createYooKassaPayment(options: CreateYooKassaPaymentOptions): Promise<{
  paymentUrl: string;
  paymentId: string;
  record: YooKassaPaymentRecord;
}> {
  const config = getYooKassaConfig();
  if (!config.enabled) {
    throw new Error('Приём платежей через ЮKassa временно отключен');
  }
  if (!config.shopId || !config.secretKey) {
    throw new Error('Реквизиты ЮKassa не настроены (отсутствует ShopID или SecretKey)');
  }

  const numAmount = Math.max(1, Math.round(options.amount * 100) / 100);
  const formattedValue = numAmount.toFixed(2);
  const idempotenceKey = crypto.randomUUID
    ? crypto.randomUUID()
    : `yoo_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  const returnUrl = options.returnUrl || config.returnUrl || 'https://santehpro.info/?payment=success';

  const requestBody: any = {
    amount: {
      value: formattedValue,
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    description: options.description.slice(0, 128),
    metadata: {
      type: options.type || 'donation',
      targetId: options.targetId || '',
      userUid: options.userUid || '',
      userName: options.userName || '',
      userEmail: options.email || '',
    },
  };

  // Чек 54-ФЗ (если указан email или телефон)
  if (options.email || options.phone) {
    requestBody.receipt = {
      customer: {
        email: options.email || undefined,
        phone: options.phone ? options.phone.replace(/[^0-9]/g, '') : undefined,
      },
      items: [
        {
          description: options.description.slice(0, 128),
          quantity: '1.00',
          amount: {
            value: formattedValue,
            currency: 'RUB',
          },
          vat_code: 1, // Без НДС
          payment_mode: 'full_payment',
          payment_subject: 'service',
        },
      ],
    };
  }

  const authHeader = 'Basic ' + Buffer.from(`${config.shopId}:${config.secretKey}`).toString('base64');

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: authHeader,
    },
    body: JSON.stringify(requestBody),
  });

  const responseData: any = await response.json();

  if (!response.ok) {
    console.error('[YooKassa API Error]', response.status, responseData);
    const msg = responseData?.description || responseData?.message || 'Ошибка создания платежа в ЮKassa';
    throw new Error(msg);
  }

  const paymentId = responseData.id;
  const paymentUrl = responseData.confirmation?.confirmation_url;

  if (!paymentUrl) {
    throw new Error('ЮKassa не вернула URL страницы оплаты');
  }

  const record: YooKassaPaymentRecord = {
    id: `yoo_${paymentId}`,
    paymentId,
    amount: numAmount,
    description: options.description,
    type: options.type || 'donation',
    targetId: options.targetId,
    userUid: options.userUid,
    userEmail: options.email,
    userName: options.userName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    confirmationUrl: paymentUrl,
    rawPayload: responseData,
  };

  saveYooKassaPaymentRecord(record);

  return {
    paymentUrl,
    paymentId,
    record,
  };
}

/**
 * Проверка статуса платежа в ЮKassa по ID
 */
export async function getPaymentStatusFromYooKassa(paymentId: string): Promise<any> {
  const config = getYooKassaConfig();
  const authHeader = 'Basic ' + Buffer.from(`${config.shopId}:${config.secretKey}`).toString('base64');

  const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса статуса платежа в ЮKassa: ${response.status}`);
  }

  return await response.json();
}
