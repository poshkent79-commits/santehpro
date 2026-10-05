import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  X,
  KeyRound,
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  // Step 1 = password entry; Step 2 = 6-digit OTP code sent to santehpro.info@yandex.ru
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [targetEmail, setTargetEmail] = useState('santehpro.info@yandex.ru');
  const [warningMessage, setWarningMessage] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 minutes

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Timer countdown for OTP validity
  useEffect(() => {
    if (step !== 'otp' || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, isOpen]);

  // Cooldown countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const cdTimer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(cdTimer);
  }, [resendCooldown]);

  // Auto-focus OTP input when entering step 2
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    }
  }, [step]);

  if (!isOpen) return null;

  // Step 1: Submit master password and request OTP to email
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError('');
    setWarningMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        if (data.requireOtp && data.pendingToken) {
          // Switch to Step 2 (2FA OTP verification)
          setPendingToken(data.pendingToken);
          setTargetEmail(data.targetEmail || 'santehpro.info@yandex.ru');
          setTimeLeftSeconds(data.expiresInSeconds || 600);
          setResendCooldown(60);
          setStep('otp');
          setOtpCode('');
          setError('');

          if (data.warning) {
            setWarningMessage(data.warning);
          }
        } else if (data.token) {
          // Fallback if OTP is bypassed
          try {
            localStorage.setItem('santehpro_admin_token', data.token);
          } catch {}
          onLoginSuccess();
          onClose();
        }
      } else if (res.status >= 500) {
        setError(
          `Сервер временно недоступен (код ${res.status}). Пожалуйста, перезапустите сервис командой "pm2 restart all" в консоли TimeWeb.`
        );
      } else {
        setError(data.error || 'Неверный пароль администратора!');
      }
    } catch (_err) {
      setError('Ошибка безопасного соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit 6-digit OTP code
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setError('Пожалуйста, введите 6-значный цифровой код из письма');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          pendingToken,
          code: cleanCode,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success && data.token) {
        try {
          localStorage.setItem('santehpro_admin_token', data.token);
        } catch {}
        setError('');
        setPassword('');
        setOtpCode('');
        setStep('password');
        onLoginSuccess();
        onClose();
      } else if (res.status >= 500) {
        setError('Внутренняя ошибка проверки кода. Попробуйте еще раз.');
      } else {
        setError(data.error || 'Неверный или просроченный код подтверждения!');
      }
    } catch (_err) {
      setError('Ошибка соединения при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP code to santehpro.info@yandex.ru
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const res = await fetch('/api/admin/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ pendingToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendCooldown(60);
        setTimeLeftSeconds(600);
        setError('');
        if (data.warning) {
          setWarningMessage(data.warning);
        }
      } else {
        setError(data.error || 'Не удалось отправить код повторно');
      }
    } catch (_err) {
      setError('Ошибка отправки кода. Проверьте интернет-соединение.');
    } finally {
      setIsResending(false);
    }
  };

  // Format MM:SS for countdown timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'password' ? (
          /* STEP 1: PASSWORD FORM */
          <>
            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white">Вход Администратора</h2>
              <p className="text-xs text-slate-400">
                Шаг 1 из 2: Введите мастер-пароль доступа
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Пароль доступа *</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Введите пароль администратора..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Проверка пароля и отправка кода...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Продолжить (запросить код)</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                🔒 Защита 2FA: одноразовый код отправляется на почту <span className="text-slate-400 font-mono">santehpro.info@yandex.ru</span>.
              </p>
            </div>
          </>
        ) : (
          /* STEP 2: 2FA ONE-TIME CODE (OTP) */
          <>
            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/25 to-indigo-500/25 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/15">
                <Mail className="w-7 h-7 text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Код подтверждения</h2>
              <p className="text-xs text-slate-300 leading-relaxed px-2">
                Пароль принят! На почту{' '}
                <span className="text-amber-400 font-semibold underline underline-offset-2">
                  {targetEmail}
                </span>{' '}
                отправлен 6-значный одноразовый код для входа.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                  <span>Одноразовый проверочный код (6 цифр)</span>
                </label>
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    disabled={isLoading || timeLeftSeconds === 0}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      if (error) setError('');
                    }}
                    placeholder="• • • • • •"
                    className="w-full bg-slate-950 border-2 border-rose-500/50 rounded-2xl py-3.5 text-center text-2xl font-black font-mono tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/20 transition disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400 px-1">
                  <span>
                    Срок действия:{' '}
                    <strong className={timeLeftSeconds < 60 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {formatTime(timeLeftSeconds)}
                    </strong>
                  </span>
                  <span>{otpCode.length}/6 цифр</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {warningMessage && !error && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Подсказка: {warningMessage}. Если письмо задерживается, проверьте папку «Спам» или логи сервера.
                  </span>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading || otpCode.trim().length !== 6 || timeLeftSeconds === 0}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 active:scale-[0.99] text-white font-extrabold text-sm transition shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Авторизация...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Подтвердить и войти</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('password');
                      setError('');
                    }}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition py-1 px-2 rounded-lg hover:bg-slate-800"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Назад к паролю</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isResending}
                    className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 disabled:text-slate-500 transition py-1 px-2 rounded-lg hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `Повтор через ${resendCooldown}с` : 'Выслать код снова'}
                    </span>
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500 leading-normal">
                ✉️ Проверьте папку «Входящие» и «Спам» почты <strong>{targetEmail}</strong>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
