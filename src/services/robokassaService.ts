import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface RobokassaConfig {
  merchantLogin: string;
  password1: string;
  password2: string;
  password3?: string;
  testPassword1?: string;
  testPassword2?: string;
  isTest: boolean;
  enabled: boolean;
}

export interface PaymentItem {
  name: string;
  quantity: number;
  sum: number;
  payment_method?: 'full_payment' | 'full_prepayment';
  payment_object?: 'service' | 'commodity';
  tax?: 'none';
}

export interface CreatePaymentOptions {
  outSum: number;
  description: string;
  email?: string;
  phone?: string;
  type: 'donation' | 'course' | 'estimate' | 'service';
  targetId?: string;
  userUid?: string;
  userName?: string;
  items?: PaymentItem[];
  incCurrLabel?: string;
}

export interface PaymentRecord {
  id: string;
  invId: number;
  outSum: number;
  description: string;
  type: 'donation' | 'course' | 'estimate' | 'service';
  targetId?: string;
  userUid?: string;
  userEmail?: string;
  userName?: string;
  status: 'pending' | 'success' | 'failed';
  paymentDate?: string;
  createdAt: string;
  rawPayload?: any;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const CONFIG_FILE = path.join(DATA_DIR, 'robokassa_config.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'robokassa_payments.json');

// Default initial config based on approved Robokassa credentials
const DEFAULT_CONFIG: RobokassaConfig = {
  merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || 'santehproinfo',
  password1: process.env.ROBOKASSA_PASSWORD_1 || 'wrSA1jRlGW1PDSLri694',
  password2: process.env.ROBOKASSA_PASSWORD_2 || 'hBh17Fp6VfMcb9tUH7Fu',
  password3: process.env.ROBOKASSA_PASSWORD_3 || 'LHI7EqL9v8TA2PzuKI2B',
  testPassword1: process.env.ROBOKASSA_TEST_PASSWORD_1 || 'FxJWtor4W3a3NbII46dk',
  testPassword2: process.env.ROBOKASSA_TEST_PASSWORD_2 || 'Eb7eZN8qT0F4RIkwVH3R',
  isTest: false,
  enabled: true,
};

export function getRobokassaConfig(): RobokassaConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to read robokassa_config.json, using defaults:', err);
  }
  return DEFAULT_CONFIG;
}

export function saveRobokassaConfig(config: Partial<RobokassaConfig>): RobokassaConfig {
  const current = getRobokassaConfig();
  const updated: RobokassaConfig = { ...current, ...config };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save robokassa config:', err);
  }
  return updated;
}

export function getPaymentsHistory(): PaymentRecord[] {
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read robokassa payments history:', err);
  }
  return [];
}

export function savePaymentRecord(record: PaymentRecord): void {
  try {
    const list = getPaymentsHistory();
    const index = list.findIndex((p) => p.invId === record.invId || p.id === record.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...record };
    } else {
      list.unshift(record);
    }
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(list.slice(0, 1000), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save payment record:', err);
  }
}

/**
 * Generate Robokassa Payment Link with support for Робочеки СМЗ (самозанятые)
 */
export function generateRobokassaPaymentUrl(options: CreatePaymentOptions): { paymentUrl: string; invId: number; record: PaymentRecord } {
  const config = getRobokassaConfig();
  const pass1 = config.isTest ? (config.testPassword1 || config.password1) : config.password1;

  // InvId must be integer > 0
  const invId = Math.floor(Date.now() / 1000) % 2147483647;
  const outSumFormatted = Number(options.outSum).toFixed(2);

  // Custom shp_ parameters (must be sorted alphabetically in signature string)
  const shpParams: Record<string, string> = {
    shp_target: options.targetId ? String(options.targetId).slice(0, 60) : 'none',
    shp_type: options.type,
    shp_user: options.userUid ? String(options.userUid).slice(0, 60) : 'anonymous',
  };

  // Build fiscal receipt for Робочеки СМЗ
  const items: PaymentItem[] = options.items && options.items.length > 0
    ? options.items
    : [
        {
          name: options.description.slice(0, 120),
          quantity: 1,
          sum: Number(options.outSum),
          payment_method: 'full_payment',
          payment_object: 'service',
          tax: 'none',
        },
      ];

  const receiptObj = {
    items: items.map((it) => ({
      name: it.name.replace(/[^\w\sа-яА-ЯёЁ.,!?-]/gi, ' ').trim().slice(0, 128),
      quantity: it.quantity || 1,
      sum: Number(it.sum || options.outSum).toFixed(2),
      payment_method: it.payment_method || 'full_payment',
      payment_object: it.payment_object || 'service',
      tax: 'none',
    })),
  };

  // Sort shp_ parameters alphabetically
  const sortedShpKeys = Object.keys(shpParams).sort();
  const shpSignaturePart = sortedShpKeys.map((k) => `${k}=${shpParams[k]}`).join(':');

  // Signature calculation:
  // Standard Robokassa format: MD5(MerchantLogin:OutSum:InvId:Password1[:shp_1=val1:...])
  // Note: When "Робочеки" (онлайн-касса) включена в личном кабинете Robokassa, Robokassa автоматически формирует
  // фискальный чек из Description и OutSum. Ручная передача Receipt не требуется и вызывает ошибку 29 при несоответствии.
  const signatureRaw = `${config.merchantLogin}:${outSumFormatted}:${invId}:${pass1}${shpSignaturePart ? `:${shpSignaturePart}` : ''}`;
  const signature = crypto.createHash('md5').update(signatureRaw).digest('hex');

  // Build query string for redirection
  const queryParams = new URLSearchParams({
    MerchantLogin: config.merchantLogin,
    OutSum: outSumFormatted,
    InvId: String(invId),
    Description: options.description.slice(0, 100),
    SignatureValue: signature,
  });

  if (options.email) {
    queryParams.set('Email', options.email);
  }

  if (options.incCurrLabel && options.incCurrLabel !== 'ALL') {
    queryParams.set('IncCurrLabel', options.incCurrLabel);
  }

  if (config.isTest) {
    queryParams.set('IsTest', '1');
  }

  for (const k of sortedShpKeys) {
    queryParams.set(k, shpParams[k]);
  }

  const paymentUrl = `https://auth.robokassa.ru/Merchant/Index.aspx?${queryParams.toString()}`;

  const record: PaymentRecord = {
    id: `pay-${invId}`,
    invId,
    outSum: Number(options.outSum),
    description: options.description,
    type: options.type,
    targetId: options.targetId,
    userUid: options.userUid,
    userEmail: options.email,
    userName: options.userName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  savePaymentRecord(record);

  return { paymentUrl, invId, record };
}

/**
 * Validates the incoming notification on Result URL from Robokassa
 */
export function verifyRobokassaResult(body: Record<string, any>): { valid: boolean; invId: number; outSum: number; shpParams: Record<string, string>; isTest: boolean } {
  const config = getRobokassaConfig();
  const outSum = body.OutSum || body.out_summ || '';
  const invId = Number(body.InvId || body.inv_id || 0);
  const signatureReceived = (body.SignatureValue || body.crc || '').toLowerCase();

  // Extract shp_ parameters
  const shpParams: Record<string, string> = {};
  for (const key of Object.keys(body)) {
    if (key.toLowerCase().startsWith('shp_')) {
      shpParams[key] = String(body[key]);
    }
  }

  const sortedShpKeys = Object.keys(shpParams).sort();
  const shpPart = sortedShpKeys.map((k) => `${k}=${shpParams[k]}`).join(':');

  // Check both production password2 and test password2
  const pass2Prod = config.password2;
  const pass2Test = config.testPassword2 || config.password2;

  const rawProd = `${outSum}:${invId}:${pass2Prod}${shpPart ? `:${shpPart}` : ''}`;
  const sigProd = crypto.createHash('md5').update(rawProd).digest('hex').toLowerCase();

  const rawTest = `${outSum}:${invId}:${pass2Test}${shpPart ? `:${shpPart}` : ''}`;
  const sigTest = crypto.createHash('md5').update(rawTest).digest('hex').toLowerCase();

  const isProdMatch = signatureReceived === sigProd;
  const isTestMatch = signatureReceived === sigTest;

  return {
    valid: isProdMatch || isTestMatch,
    invId,
    outSum: parseFloat(outSum) || 0,
    shpParams,
    isTest: isTestMatch && !isProdMatch,
  };
}
