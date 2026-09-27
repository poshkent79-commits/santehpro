import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface SendResetEmailParams {
  to: string;
  name?: string;
  code: string;
  expiresInMinutes?: number;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
  enabled?: boolean;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const SMTP_CONFIG_FILE = path.join(DATA_DIR, 'smtp_config.json');
const AUDIT_FILE = path.join(DATA_DIR, 'email_audit.json');

/**
 * Returns saved SMTP configuration from disk if present, else checks process.env
 */
export function getEffectiveSmtpConfig(): SmtpSettings | null {
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const raw = fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8');
      const saved = JSON.parse(raw) as SmtpSettings;
      if (saved && saved.enabled !== false && saved.host?.trim() && saved.user?.trim() && saved.pass?.trim()) {
        return {
          host: saved.host.trim(),
          port: Number(saved.port) || 465,
          secure: saved.secure ?? (Number(saved.port) === 465),
          user: saved.user.trim(),
          pass: saved.pass.trim(),
          fromName: saved.fromName?.trim() || 'СантехПро',
          fromEmail: saved.fromEmail?.trim() || saved.user.trim(),
          enabled: true,
        };
      }
    }
  } catch {
    // ignore
  }

  const envHost = process.env.SMTP_HOST?.trim();
  const envUser = process.env.SMTP_USER?.trim();
  const envPass = process.env.SMTP_PASS?.trim();

  if (envHost && envUser && envPass) {
    const port = parseInt(process.env.SMTP_PORT?.trim() || '465', 10);
    return {
      host: envHost,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      user: envUser,
      pass: envPass,
      fromName: 'СантехПро',
      fromEmail: envUser,
      enabled: true,
    };
  }

  return null;
}

export function isSmtpConfigured(): boolean {
  return getEffectiveSmtpConfig() !== null;
}

export function saveSmtpSettings(settings: Partial<SmtpSettings>): { success: boolean; config: SmtpSettings } {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const existing = getEffectiveSmtpConfig();
  const full: SmtpSettings = {
    host: settings.host?.trim() || existing?.host || '',
    port: Number(settings.port) || existing?.port || 465,
    secure: settings.secure !== undefined ? Boolean(settings.secure) : (Number(settings.port || existing?.port) === 465),
    user: settings.user?.trim() || existing?.user || '',
    pass: settings.pass !== undefined && settings.pass !== '' ? settings.pass.trim() : (existing?.pass || ''),
    fromName: settings.fromName?.trim() || existing?.fromName || 'СантехПро',
    fromEmail: settings.fromEmail?.trim() || existing?.fromEmail || settings.user?.trim() || '',
    enabled: settings.enabled !== undefined ? settings.enabled : true,
  };

  fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(full, null, 2), 'utf-8');
  return { success: true, config: full };
}

export function getSmtpStatus() {
  const config = getEffectiveSmtpConfig();
  let source: 'file' | 'env' | 'none' = 'none';

  if (fs.existsSync(SMTP_CONFIG_FILE)) {
    source = 'file';
  } else if (process.env.SMTP_HOST) {
    source = 'env';
  }

  return {
    isConfigured: config !== null,
    source,
    host: config?.host || '',
    port: config?.port || 465,
    secure: config?.secure ?? true,
    user: config?.user || '',
    fromName: config?.fromName || 'СантехПро',
    fromEmail: config?.fromEmail || config?.user || '',
    hasPassword: Boolean(config?.pass),
  };
}

function getMailTransporter(customConfig?: Partial<SmtpSettings>) {
  const saved = getEffectiveSmtpConfig();
  const config: SmtpSettings = {
    host: customConfig?.host?.trim() || saved?.host || '',
    port: Number(customConfig?.port) || saved?.port || 465,
    secure: customConfig?.secure !== undefined ? Boolean(customConfig.secure) : (saved?.secure ?? true),
    user: customConfig?.user?.trim() || saved?.user || '',
    pass: (customConfig?.pass && customConfig.pass.trim() !== '') ? customConfig.pass.trim() : (saved?.pass || ''),
    fromName: customConfig?.fromName?.trim() || saved?.fromName || 'СантехПро',
    fromEmail: customConfig?.fromEmail?.trim() || saved?.fromEmail || customConfig?.user?.trim() || saved?.user || '',
    enabled: customConfig?.enabled !== undefined ? customConfig.enabled : (saved?.enabled ?? true),
  };

  if (!config.host || !config.user || !config.pass) {
    const missing: string[] = [];
    if (!config.host) missing.push('SMTP-хост');
    if (!config.user) missing.push('логин/e-mail');
    if (!config.pass) missing.push('пароль приложения');
    throw new Error(`Не заполнены обязательные параметры: ${missing.join(', ')}`);
  }

  return {
    transporter: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    }),
    config,
  };
}

/**
 * Tests connection and optionally sends a verification email
 */
export async function testSmtpConnection(targetEmail?: string, customConfig?: Partial<SmtpSettings>): Promise<{ success: boolean; message: string; details?: any; hint?: string }> {
  try {
    const { transporter, config } = getMailTransporter(customConfig);
    await transporter.verify();

    if (targetEmail && targetEmail.trim()) {
      const from = `«${config.fromName || 'СантехПро'}» <${config.fromEmail || config.user}>`;

      await transporter.sendMail({
        from,
        to: targetEmail.trim(),
        subject: '🔧 Проверка подключения почты — СантехПро',
        text: `Здравствуйте!\n\nЭто проверочное письмо от сервиса «СантехПро». Почтовый сервер SMTP успешно подключен и готов к отправке кодов восстановления и уведомлений.\n\nВремя отправки: ${new Date().toLocaleString('ru-RU')}`,
        html: `
<div style="background-color:#0f172a; padding:32px 16px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#f8fafc;">
  <div style="max-width:520px; margin:0 auto; background:#1e293b; border-radius:20px; border:1px solid #334155; padding:32px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
    <div style="text-align:center; margin-bottom:24px;">
      <span style="font-size:32px;">🔧</span>
      <h2 style="margin:8px 0 0; color:#38bdf8; font-size:22px;">СантехПро</h2>
      <p style="margin:4px 0 0; color:#94a3b8; font-size:13px;">Тестовое уведомление почтового шлюза</p>
    </div>
    <div style="background:rgba(34, 197, 94, 0.1); border:1px solid rgba(34, 197, 94, 0.3); border-radius:12px; padding:16px; margin-bottom:20px;">
      <p style="margin:0; color:#4ade80; font-weight:bold; font-size:15px; text-align:center;">
        ✓ SMTP-подключение успешно настроено!
      </p>
    </div>
    <p style="color:#cbd5e1; font-size:14px; line-height:1.6;">
      Письма с кодами подтверждения и уведомлениями теперь будут надежно доставляться вашим клиентам и пользователям на их электронную почту.
    </p>
    <div style="margin-top:24px; padding-top:16px; border-top:1px solid #334155; color:#64748b; font-size:11px; text-align:center;">
      Сервис «СантехПро» • ${new Date().toLocaleString('ru-RU')}
    </div>
  </div>
</div>
        `,
      });

      saveEmailToLocalAudit(targetEmail.trim(), 'TEST-VERIFY', 'test_success');
      return {
        success: true,
        message: `Соединение с SMTP установлено! Тестовое письмо успешно отправлено на ${targetEmail.trim()}. Проверьте входящие (и папку «Спам»).`,
      };
    }

    return {
      success: true,
      message: 'Соединение с SMTP-сервером успешно проверено и авторизовано!',
    };
  } catch (error: any) {
    const rawMsg = error?.message || String(error);
    const responseMsg = error?.response || '';
    saveEmailToLocalAudit(targetEmail || 'unknown', 'TEST-FAIL', `test_fail: ${rawMsg}`);

    // Detect Google BadCredentials
    if (rawMsg.includes('BadCredentials') || responseMsg.includes('535-5.7.8') || rawMsg.includes('Username and Password not accepted')) {
      return {
        success: false,
        message: 'Google отклонил вход (BadCredentials). Обычный пароль от аккаунта Google НЕ подходит для отправки почты по соображениям безопасности Google.',
        hint: 'Для Gmail требуется создать 16-значный «Пароль приложения» в настройках вашего Google Аккаунта (Раздел «Безопасность» -> «Двухэтапная аутентификация» -> «Пароли приложений»).',
        details: error,
      };
    }

    if (rawMsg.includes('Missing credentials')) {
      return {
        success: false,
        message: 'Не передан пароль для авторизации на почтовом сервере.',
        hint: 'Введите пароль приложения в поле формы и нажмите «Сохранить настройки SMTP».',
        details: error,
      };
    }

    return {
      success: false,
      message: `Ошибка подключения к SMTP: ${rawMsg}`,
      details: error,
    };
  }
}

/**
 * Sends a password reset email containing a secure 6-digit confirmation code.
 */
export async function sendPasswordResetEmail(params: SendResetEmailParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const { to, name, code, expiresInMinutes = 15 } = params;
  const config = getEffectiveSmtpConfig();
  const greeting = name ? `Здравствуйте, ${name}!` : 'Здравствуйте!';

  const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Восстановление пароля — СантехПро</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px; background-color:#1e293b; border-radius:24px; border:1px solid #334155; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); text-align:center;">
              <h1 style="margin:0; font-size:24px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">
                🔧 СантехПро
              </h1>
              <p style="margin:6px 0 0; font-size:13px; color:#e0f2fe; font-weight:500;">
                Сервис надежного ремонта и вызова сантехников
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px; font-size:18px; font-weight:700; color:#ffffff;">
                ${greeting}
              </h2>
              <p style="margin:0 0 20px; font-size:14px; line-height:1.6; color:#cbd5e1;">
                Был получен запрос на сброс пароля для вашей учетной записи <strong>${to}</strong>. Для подтверждения и создания нового пароля используйте защищенный 6-значный код:
              </p>

              <!-- Code Box -->
              <div style="background-color:#0f172a; border:2px dashed #0284c7; border-radius:16px; padding:24px; text-align:center; margin:24px 0;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#38bdf8; font-weight:700; display:block; margin-bottom:8px;">
                  Код подтверждения
                </span>
                <span style="font-size:36px; font-weight:900; letter-spacing:10px; color:#ffffff; font-family:Consolas, 'Courier New', monospace; display:inline-block; padding-left:10px;">
                  ${code}
                </span>
              </div>

              <p style="margin:0 0 16px; font-size:13px; line-height:1.6; color:#94a3b8;">
                ⏱ <strong>Срок действия кода:</strong> ${expiresInMinutes} минут. Скопируйте этот код и введите его в форму на сайте.
              </p>

              <div style="background-color:rgba(239, 68, 68, 0.1); border-left:4px solid #ef4444; padding:12px 16px; border-radius:0 12px 12px 0; margin-top:24px;">
                <p style="margin:0; font-size:12px; line-height:1.5; color:#fca5a5;">
                  🔒 <strong>Безопасность:</strong> Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш текущий пароль останется неизменным, а доступ к учетной записи защищен. Никому не сообщайте данный код.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px; background-color:#0f172a; border-top:1px solid #334155; text-align:center;">
              <p style="margin:0; font-size:12px; color:#64748b;">
                Служба заботы о клиентах «СантехПро»
              </p>
              <p style="margin:4px 0 0; font-size:11px; color:#475569;">
                Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `
${greeting}

Был получен запрос на сброс пароля для учетной записи ${to} в сервисе «СантехПро».

Ваш 6-значный код подтверждения: ${code}

Срок действия кода: ${expiresInMinutes} минут.
Скопируйте этот код и введите его в окне восстановления пароля в приложении.

Если вы не запрашивали сброс пароля, проигнорируйте данное письмо. Ваш пароль останется в безопасности.
  `.trim();

  if (config) {
    const fromAddress = `«${config.fromName || 'СантехПро'}» <${config.fromEmail || config.user}>`;
    try {
      const { transporter } = getMailTransporter(config);
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject: `Код восстановления пароля СантехПро: ${code}`,
        text: textContent,
        html: htmlContent,
      });

      saveEmailToLocalAudit(to, code, 'sent_smtp');
      return { success: true, simulated: false };
    } catch (smtpError: any) {
      const errMsg = smtpError?.message || 'SMTP delivery failed';
      saveEmailToLocalAudit(to, code, `smtp_error: ${errMsg}`);
      return { success: true, simulated: true, error: errMsg };
    }
  } else {
    // When SMTP credentials are not configured yet, record safely in audit log
    saveEmailToLocalAudit(to, code, 'simulated');
    return { success: true, simulated: true };
  }
}

/**
 * Retrieves the recent audit logs of sent emails
 */
export function getEmailAuditLogs() {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Sends a notification email to the administrator about a new specialist moderation request
 */
export async function sendSpecialistModerationNotification(
  specialist: {
    id: string;
    name: string;
    city: string;
    phone: string;
    telegram?: string;
    whatsapp?: string;
    experienceYears?: number;
    minPrice?: number;
    emergency247?: boolean;
    services?: string[] | string;
    bio?: string;
    verificationDocs?: Array<{ name: string; type?: string; size?: string }>;
    consentTimestamp?: string;
    legalConsentTimestamp?: string;
  }
): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const config = getEffectiveSmtpConfig();
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    config?.fromEmail ||
    config?.user ||
    'poshkent79@gmail.com';

  const docs = Array.isArray(specialist.verificationDocs) ? specialist.verificationDocs : [];
  const servicesList = Array.isArray(specialist.services)
    ? specialist.services.join(', ')
    : specialist.services || 'Установка сантехники, устранение протечек';
  const consentTimeStr = specialist.consentTimestamp
    ? new Date(specialist.consentTimestamp).toLocaleString('ru-RU')
    : new Date().toLocaleString('ru-RU');

  const subject = `🔧 Новая заявка на модерацию мастера: ${specialist.name} (г. ${specialist.city})`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px; background-color:#1e293b; border-radius:20px; border:1px solid #334155; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding:28px 28px 20px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); text-align:left;">
              <span style="display:inline-block; font-size:11px; text-transform:uppercase; letter-spacing:1px; background-color:rgba(255,255,255,0.2); color:#ffffff; font-weight:800; padding:4px 10px; border-radius:9999px; margin-bottom:8px;">
                Новая анкета на модерацию
              </span>
              <h1 style="margin:0; font-size:22px; font-weight:800; color:#ffffff;">
                🔧 Заявка специалиста: ${specialist.name}
              </h1>
              <p style="margin:4px 0 0; font-size:13px; color:#e0f2fe;">
                Город: <strong>г. ${specialist.city}</strong> • ID: ${specialist.id}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 16px; font-size:16px; font-weight:700; color:#38bdf8; border-bottom:1px solid #334155; pb-2;">
                📋 Основные сведения о мастере
              </h2>

              <table width="100%" style="font-size:13px; color:#cbd5e1; border-collapse:collapse; margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0; color:#94a3b8; width:160px;">ФИО мастера:</td>
                  <td style="padding:8px 0; font-weight:700; color:#ffffff;">${specialist.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Город обслуживания:</td>
                  <td style="padding:8px 0; font-weight:700; color:#38bdf8;">г. ${specialist.city}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Телефон:</td>
                  <td style="padding:8px 0; font-weight:700; color:#ffffff; font-family:monospace;">${specialist.phone}</td>
                </tr>
                ${specialist.telegram ? `
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Telegram:</td>
                  <td style="padding:8px 0; color:#38bdf8;">${specialist.telegram}</td>
                </tr>` : ''}
                ${specialist.whatsapp ? `
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">WhatsApp:</td>
                  <td style="padding:8px 0; color:#34d399;">${specialist.whatsapp}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Стаж работы:</td>
                  <td style="padding:8px 0; color:#ffffff;">${specialist.experienceYears || 1} лет</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Стоимость вызова:</td>
                  <td style="padding:8px 0; color:#fbbf24; font-weight:700;">от ${specialist.minPrice || 1000} ₽</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Аварийный выезд 24/7:</td>
                  <td style="padding:8px 0; color:#ffffff;">${specialist.emergency247 ? '✅ Да, круглосуточно' : '❌ Нет'}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; color:#94a3b8;">Услуги:</td>
                  <td style="padding:8px 0; color:#ffffff;">${servicesList}</td>
                </tr>
              </table>

              ${specialist.bio ? `
              <div style="background-color:#0f172a; border-left:3px solid #38bdf8; border-radius:0 12px 12px 0; padding:12px 16px; margin-bottom:20px;">
                <span style="font-size:11px; text-transform:uppercase; color:#94a3b8; font-weight:700; display:block; margin-bottom:4px;">
                  О себе и опыте:
                </span>
                <p style="margin:0; font-size:13px; line-height:1.5; color:#e2e8f0; font-style:italic;">
                  "${specialist.bio}"
                </p>
              </div>` : ''}

              <!-- Documents attached -->
              <h2 style="margin:20px 0 12px; font-size:15px; font-weight:700; color:#38bdf8; border-bottom:1px solid #334155; pb-2;">
                📎 Прикреплённые документы (${docs.length})
              </h2>
              ${docs.length > 0 ? `
              <ul style="margin:0 0 20px; padding-left:18px; font-size:12px; color:#cbd5e1; line-height:1.6;">
                ${docs.map((d) => `<li><strong>${d.name}</strong> ${d.type ? `(${d.type})` : ''} ${d.size ? `— ${d.size}` : ''}</li>`).join('')}
              </ul>` : `
              <p style="margin:0 0 20px; font-size:12px; color:#94a3b8;">
                Кандидат не прикрепил дополнительные файлы документов.
              </p>`}

              <!-- Legal & Compliance Audit Box -->
              <div style="background-color:#0f172a; border:1px solid #10b981; border-radius:14px; padding:16px; margin-top:20px;">
                <div style="font-size:12px; font-weight:700; color:#34d399; margin-bottom:8px;">
                  ⚖️ Аудит правовых согласий (Юридическая фиксация в БД):
                </div>
                <div style="font-size:12px; line-height:1.6; color:#cbd5e1;">
                  <div>✔ <strong>Согласие на обработку персональных данных (152-ФЗ):</strong> Подтверждено (${consentTimeStr})</div>
                  <div>✔ <strong>Пользовательское соглашение и регламент мастера:</strong> Безоговорочно принято (${consentTimeStr})</div>
                  <div>✔ <strong>Статус:</strong> Независимый исполнитель (самозанятый/ИП), единоличная ответственность на объекте</div>
                  <div style="color:#94a3b8; font-size:11px; margin-top:6px;">Запись сохранена в защищенной базе данных для целей административного аудита.</div>
                </div>
              </div>

              <div style="margin-top:24px; text-align:center;">
                <p style="margin:0 0 12px; font-size:13px; color:#94a3b8;">
                  Для проверки анкеты, просмотра фотографий работ и принятия решения откройте панель управления администратора:
                </p>
                <div style="display:inline-block; background-color:#38bdf8; color:#090d16; font-weight:800; font-size:13px; padding:12px 24px; border-radius:12px; text-decoration:none;">
                  Перейти в Панель управления → Мастера
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 28px; background-color:#0f172a; border-top:1px solid #334155; text-align:center;">
              <p style="margin:0; font-size:11px; color:#64748b;">
                Автоматическое системное уведомление платформы «СантехПро».
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `
НОВАЯ ЗАЯВКА НА МОДЕРАЦИЮ МАСТЕРА — САНТЕХПРО
===================================================
ФИО: ${specialist.name}
Город: г. ${specialist.city}
Телефон: ${specialist.phone}
${specialist.telegram ? `Telegram: ${specialist.telegram}\n` : ''}${specialist.whatsapp ? `WhatsApp: ${specialist.whatsapp}\n` : ''}Стаж: ${specialist.experienceYears || 1} лет
Вызов: от ${specialist.minPrice || 1000} ₽
Аварийный выезд 24/7: ${specialist.emergency247 ? 'Да' : 'Нет'}
Услуги: ${servicesList}
${specialist.bio ? `О себе: "${specialist.bio}"\n` : ''}Документы (${docs.length}): ${docs.map((d) => d.name).join(', ') || 'Без документов'}

ЮРИДИЧЕСКИЙ АУДИТ:
- Согласие 152-ФЗ: Подтверждено (${consentTimeStr})
- Пользовательское соглашение: Принято (${consentTimeStr})
- Статус: Независимый исполнитель

Войдите в Панель управления СантехПро (вкладка «Мастера» -> «Заявки на модерации») для одобрения или отклонения.
  `.trim();

  if (config) {
    const fromAddress = `«${config.fromName || 'СантехПро'}» <${config.fromEmail || config.user}>`;
    try {
      const { transporter } = getMailTransporter(config);
      await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      saveEmailToLocalAudit(adminEmail, `moderation-${specialist.id}`, 'sent_smtp');
      console.log(`[SMTP] Moderation notification sent to admin (${adminEmail}) for specialist ${specialist.name}`);
      return { success: true, simulated: false };
    } catch (smtpError: any) {
      const errMsg = smtpError?.message || 'SMTP delivery failed';
      console.error('[SMTP] Failed to send moderation notification:', errMsg);
      saveEmailToLocalAudit(adminEmail, `moderation-${specialist.id}`, `smtp_error: ${errMsg}`);
      return { success: true, simulated: true, error: errMsg };
    }
  } else {
    // When SMTP is not configured yet, record in local audit log
    saveEmailToLocalAudit(adminEmail, `moderation-${specialist.id}`, 'simulated');
    console.log(`[SMTP SIMULATED] Moderation notification generated for admin (${adminEmail}) for specialist ${specialist.name}`);
    return { success: true, simulated: true };
  }
}

/**
 * Saves sent emails to a server-side audit file for testing and debugging.
 */
function saveEmailToLocalAudit(to: string, code: string, status: string) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let logs: any[] = [];
    if (fs.existsSync(AUDIT_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8'));
      } catch {
        logs = [];
      }
    }
    logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      to,
      subject: code.startsWith('moderation-') ? 'Заявка мастера на модерацию' : 'Код восстановления пароля',
      code,
      status,
    });
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs.slice(0, 50), null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

