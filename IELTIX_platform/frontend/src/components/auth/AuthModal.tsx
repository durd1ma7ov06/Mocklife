import React, { useState, useEffect } from 'react';
import { User as UserIcon, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../config/api';
import { AuthLayout } from './AuthLayout';
import { AuthCard } from './AuthCard';
import { PhoneOrEmailInput } from './PhoneOrEmailInput';
import { PasswordInput } from './PasswordInput';
import { OtpInput } from './OtpInput';
import { SocialAuthButtons } from './SocialAuthButtons';
import { AuthSubmitButton } from './AuthSubmitButton';

export type AuthView = 'LOGIN' | 'REGISTER' | 'OTP' | 'FORGOT' | 'NEW_PASSWORD' | 'TELEGRAM';
export type LoginMethod = 'OTP' | 'PASSWORD';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialView = 'LOGIN',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const {
    loginWithOtp,
    loginWithPassword,
    register,
    requestOtp,
    resetPassword,
    loginWithTelegram,
    isLoading,
  } = useAuth();

  // Active view state
  const [view, setView] = useState<AuthView>(initialView);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('OTP');

  // Form field states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Field errors
  const [errors, setErrors] = useState<{
    name?: string | null;
    phone?: string | null;
    password?: string | null;
    confirmPassword?: string | null;
    terms?: string | null;
    otp?: string | null;
    general?: string | null;
  }>({});

  // Telegram Session State
  const [tgSessionCode, setTgSessionCode] = useState<string | null>(null);
  const [tgDeepLink, setTgDeepLink] = useState<string>('https://t.me/MockLife_bot');
  const [tgBotUsername, setTgBotUsername] = useState<string>('MockLife_bot');
  const [tgPolling, setTgPolling] = useState<boolean>(false);
  const [tgIdentifier, setTgIdentifier] = useState<string>('');
  const [tgLoading, setTgLoading] = useState<boolean>(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP countdown
  const [countdown, setCountdown] = useState(0);

  // Sync initial view when modal opens
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setErrors({});
      setSuccessMessage(null);
    }
  }, [isOpen, initialView]);

  // Timer countdown effect
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Telegram WebApp Auto-detect & Session Initialization
  useEffect(() => {
    if (view === 'TELEGRAM') {
      // 1. Agar foydalanuvchi Telegram Mini App ichida ochgan bo'lsa
      const tgApp = (window as any).Telegram?.WebApp;
      if (tgApp?.initDataUnsafe?.user) {
        const u = tgApp.initDataUnsafe.user;
        loginWithTelegram({
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          username: u.username,
        }).then(() => {
          setSuccessMessage('Telegram orqali avtomatik kirdingiz!');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        });
        return;
      }

      // 2. Aks holda bot bilan ulanish uchun sessiya yaratish
      apiClient.createTelegramLoginSession().then((res) => {
        if (res.sessionCode) {
          setTgSessionCode(res.sessionCode);
          setTgDeepLink(res.deepLink);
          setTgBotUsername(res.botUsername);
          setTgPolling(true);
        }
      });
    } else {
      setTgPolling(false);
    }
  }, [view]);

  // Telegram sessiya statusini tekshirib turish (Polling)
  useEffect(() => {
    let timer: any;
    if (tgPolling && tgSessionCode && view === 'TELEGRAM') {
      timer = setInterval(async () => {
        const res = await apiClient.checkTelegramSessionStatus(tgSessionCode);
        if (res.success && res.status === 'CONFIRMED' && res.user) {
          clearInterval(timer);
          setTgPolling(false);
          setSuccessMessage('✅ Telegram orqali muvaffaqiyatli kirildi!');
          loginWithTelegram(res.user);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1000);
        }
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [tgPolling, tgSessionCode, view]);

  // Tezkor Telegram orqali kirish (1-bosqichda)
  const handleQuickTelegramLogin = async () => {
    setTgLoading(true);
    const tgId = Math.floor(10000000 + Math.random() * 90000000);
    const candidateName = name.trim() || 'IELTS Nomzod';
    const res = await loginWithTelegram({
      id: tgId,
      name: candidateName,
      username: tgIdentifier ? tgIdentifier.replace('@', '') : 'ielts_master',
      phone: phone.length > 5 ? phone : '+998901234567',
    });
    setTgLoading(false);
    if (res.success) {
      setSuccessMessage('✅ Telegram orqali muvaffaqiyatli kirildi!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } else {
      setErrors({ general: res.error || 'Xatolik yuz berdi' });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setErrors({});
    setSuccessMessage(null);
  };

  // Helper validation functions
  const validatePhone = (val: string): boolean => {
    const digits = val.replace(/\D/g, '');
    return digits.length === 12; // 998 + 9 digits
  };

  // Switch between tabs (Login / Register)
  const handleTabChange = (tab: 'login' | 'register') => {
    resetForm();
    setView(tab === 'login' ? 'LOGIN' : 'REGISTER');
  };

  // 1. Send OTP for Login
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (!validatePhone(phone)) {
      setErrors({ phone: t.auth.validation.phoneInvalid });
      return;
    }

    const res = await requestOtp(phone);
    if (res.success) {
      setCountdown(59);
      setView('OTP');
      setSuccessMessage(`${t.auth.messages.otpSentSuccess} (${res.debugCode || '1234'})`);
    } else {
      setErrors({ general: res.message || 'SMS kod yuborishda xatolik yuz berdi' });
    }
  };

  // 2. Password Login Submit
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    let hasError = false;
    const newErrors: typeof errors = {};

    if (!phone || phone.trim().length < 9) {
      newErrors.phone = t.auth.validation.phoneRequired;
      hasError = true;
    }
    if (!password) {
      newErrors.password = t.auth.validation.passwordRequired;
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = t.auth.validation.passwordTooShort;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const res = await loginWithPassword(phone, password);
    if (res.success) {
      setSuccessMessage(t.auth.messages.loginSuccess);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 1000);
    } else {
      setErrors({ general: res.error || t.auth.validation.otpInvalid });
    }
  };

  // 3. Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    let hasError = false;
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = t.auth.validation.nameRequired;
      hasError = true;
    }
    if (!validatePhone(phone)) {
      newErrors.phone = t.auth.validation.phoneInvalid;
      hasError = true;
    }
    if (!password) {
      newErrors.password = t.auth.validation.passwordRequired;
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = t.auth.validation.passwordTooShort;
      hasError = true;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t.auth.validation.passwordsDoNotMatch;
      hasError = true;
    }
    if (!termsAccepted) {
      newErrors.terms = t.auth.validation.termsRequired;
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const res = await register({ name, phone, password });
    if (res.success) {
      setSuccessMessage(t.auth.messages.registerSuccess);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 1200);
    } else {
      setErrors({ general: res.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi' });
    }
  };

  // 4. Verify OTP Submit (from Login or Password Reset)
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (otpCode.length !== 4) {
      setErrors({ otp: t.auth.validation.otpRequired });
      return;
    }

    if (view === 'OTP') {
      const res = await loginWithOtp(phone, otpCode);
      if (res.success) {
        setSuccessMessage(t.auth.messages.loginSuccess);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 1000);
      } else {
        setErrors({ otp: res.error || t.auth.validation.otpInvalid });
      }
    }
  };

  // 5. Send OTP for Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (!validatePhone(phone)) {
      setErrors({ phone: t.auth.validation.phoneInvalid });
      return;
    }

    const res = await requestOtp(phone);
    if (res.success) {
      setCountdown(59);
      setView('NEW_PASSWORD');
      setSuccessMessage(`${t.auth.messages.otpSentSuccess} (${res.debugCode || '1234'})`);
    } else {
      setErrors({ general: res.message || 'Xatolik yuz berdi' });
    }
  };

  // 6. Reset Password with new credentials
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    if (otpCode.length !== 4) {
      setErrors({ otp: t.auth.validation.otpRequired });
      return;
    }
    if (!password || password.length < 6) {
      setErrors({ password: t.auth.validation.passwordTooShort });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: t.auth.validation.passwordsDoNotMatch });
      return;
    }

    const res = await resetPassword({ phone, code: otpCode, newPassword: password });
    if (res.success) {
      setSuccessMessage(t.auth.messages.passwordResetSuccess);
      setTimeout(() => {
        setView('LOGIN');
        setLoginMethod('PASSWORD');
        resetForm();
      }, 1500);
    } else {
      setErrors({ general: res.error || 'Parolni yangilashda xatolik yuz berdi' });
    }
  };

  // Social Login Mock Click
  const handleSocialClick = (provider: string) => {
    alert(`${provider} orqali tezkor kirish sinov rejimida ishlamoqda. Tizimga avtomatik kirilmoqda...`);
    loginWithOtp(phone.length > 5 ? phone : '+998901234567', '1234').then(() => {
      onSuccess?.();
      onClose();
    });
  };

  return (
    <AuthLayout isOpen={isOpen} onClose={onClose}>
      {/* VIEW 1: LOGIN */}
      {view === 'LOGIN' && (
        <AuthCard
          title={t.auth.loginTitle}
          subtitle={t.auth.loginSubtitle}
          activeTab="login"
          onTabChange={handleTabChange}
          showTabs={true}
          onClose={onClose}
          loginTabLabel={t.auth.loginTab}
          registerTabLabel={t.auth.registerTab}
          secureNote={t.auth.secureNote}
        >
          {/* Method selector pills: SMS Kod vs Parol */}
          <div className="bg-[#fdf6e9] p-1 rounded-2xl border border-[#eadfc9] flex items-center mb-5">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('OTP');
                setErrors({});
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                loginMethod === 'OTP'
                  ? 'bg-white text-[#ef3b2d] shadow-sm'
                  : 'text-[#4a5068] hover:text-[#10152b]'
              }`}
            >
              {t.auth.methodOtp}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('PASSWORD');
                setErrors({});
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                loginMethod === 'PASSWORD'
                  ? 'bg-white text-[#ef3b2d] shadow-sm'
                  : 'text-[#4a5068] hover:text-[#10152b]'
              }`}
            >
              {t.auth.methodPassword}
            </button>
          </div>

          {/* General Error or Success Message */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#ef3b2d] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#12935a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form depending on Login Method */}
          {loginMethod === 'OTP' ? (
            <form onSubmit={handleSendLoginOtp} className="space-y-4">
              <PhoneOrEmailInput
                label={t.auth.phoneLabel}
                placeholder={t.auth.phonePlaceholder}
                value={phone}
                onChange={(val) => {
                  setPhone(val);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                }}
                error={errors.phone}
                isValid={validatePhone(phone)}
                autoFocus
              />

              <AuthSubmitButton
                label={t.auth.sendOtpBtn}
                loading={isLoading}
              />
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <PhoneOrEmailInput
                label={t.auth.phoneLabel}
                placeholder={t.auth.phonePlaceholder}
                value={phone}
                onChange={(val) => {
                  setPhone(val);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                }}
                error={errors.phone}
                isValid={validatePhone(phone)}
              />

              <PasswordInput
                label={t.auth.passwordLabel}
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                error={errors.password}
                isValid={password.length >= 6}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView('FORGOT')}
                  className="text-xs font-bold text-[#ef3b2d] hover:text-[#d62f22] hover:underline transition"
                >
                  {t.auth.forgotPasswordLink}
                </button>
              </div>

              <AuthSubmitButton
                label={t.auth.loginBtn}
                loading={isLoading}
              />
            </form>
          )}

          {/* Social Auth */}
          <SocialAuthButtons
            dividerText={t.auth.orContinueWith}
            googleLabel={t.auth.googleBtn}
            telegramLabel="Telegram orqali kirish"
            onGoogleClick={() => handleSocialClick('Google')}
            onTelegramClick={() => setView('TELEGRAM')}
          />
        </AuthCard>
      )}

      {/* VIEW 2: REGISTER */}
      {view === 'REGISTER' && (
        <AuthCard
          title={t.auth.registerTitle}
          subtitle={t.auth.registerSubtitle}
          activeTab="register"
          onTabChange={handleTabChange}
          showTabs={true}
          onClose={onClose}
          loginTabLabel={t.auth.loginTab}
          registerTabLabel={t.auth.registerTab}
          secureNote={t.auth.secureNote}
        >
          {errors.general && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#ef3b2d] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#12935a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#4a5068] mb-1.5 uppercase tracking-wider">
                {t.auth.nameLabel}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#7a7f95]">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder={t.auth.namePlaceholder}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-full border text-sm font-bold text-[#10152b] transition-all outline-none bg-[#fdf6e9]/40 ${
                    errors.name
                      ? 'border-[#ef3b2d] bg-red-50/40 ring-2 ring-[#ef3b2d]/15'
                      : name.trim().length >= 2
                      ? 'border-[#12935a] bg-emerald-50/20'
                      : 'border-[#eadfc9] focus:border-[#ef3b2d] focus:bg-white focus:ring-2 focus:ring-[#ef3b2d]/15'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs font-bold text-[#ef3b2d] pl-3">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <PhoneOrEmailInput
              label={t.auth.phoneLabel}
              placeholder={t.auth.phonePlaceholder}
              value={phone}
              onChange={(val) => {
                setPhone(val);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              error={errors.phone}
              isValid={validatePhone(phone)}
            />

            {/* Password */}
            <PasswordInput
              label={t.auth.passwordLabel}
              placeholder={t.auth.passwordPlaceholder}
              value={password}
              onChange={(val) => {
                setPassword(val);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
              isValid={password.length >= 6}
              showStrengthMeter
              strengthLabels={t.auth.passwordStrength}
            />

            {/* Confirm Password */}
            <PasswordInput
              label={t.auth.confirmPasswordLabel}
              placeholder={t.auth.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChange={(val) => {
                setConfirmPassword(val);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
              isValid={confirmPassword.length >= 6 && confirmPassword === password}
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: null }));
                }}
                className="mt-1 w-4 h-4 rounded border-[#eadfc9] text-[#ef3b2d] focus:ring-[#ef3b2d] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#4a5068] font-semibold cursor-pointer">
                {t.auth.termsAgreement}
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs font-bold text-[#ef3b2d] pl-1">{errors.terms}</p>
            )}

            <AuthSubmitButton
              label={t.auth.registerBtn}
              loading={isLoading}
            />
          </form>

          {/* Social Auth */}
          <SocialAuthButtons
            dividerText={t.auth.orContinueWith}
            googleLabel={t.auth.googleBtn}
            telegramLabel="Telegram orqali kirish"
            onGoogleClick={() => handleSocialClick('Google')}
            onTelegramClick={() => setView('TELEGRAM')}
          />
        </AuthCard>
      )}

      {/* VIEW 3: OTP VERIFICATION */}
      {view === 'OTP' && (
        <AuthCard
          title={t.auth.otpTitle}
          subtitle={`${phone} ${t.auth.otpSubtitle}`}
          showTabs={false}
          showBack={true}
          onBack={() => setView('LOGIN')}
          onClose={onClose}
          secureNote={t.auth.secureNote}
        >
          {errors.general && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#ef3b2d] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#12935a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <OtpInput
              value={otpCode}
              onChange={(code) => {
                setOtpCode(code);
                if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
              }}
              error={errors.otp}
              resendCountdown={countdown}
              onResend={async () => {
                const res = await requestOtp(phone);
                if (res.success) {
                  setCountdown(59);
                  setSuccessMessage(`${t.auth.messages.otpSentSuccess} (${res.debugCode || '1234'})`);
                }
              }}
              labels={{
                resendCode: t.auth.resendCode,
                resendIn: t.auth.resendIn,
                demoNote: t.auth.demoOtpNote,
              }}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setView('LOGIN')}
                className="text-xs font-bold text-[#7a7f95] hover:text-[#ef3b2d] transition"
              >
                {t.auth.changePhone}
              </button>
            </div>

            <AuthSubmitButton
              label={t.auth.verifyOtpBtn}
              loading={isLoading}
              disabled={otpCode.length !== 4}
            />
          </form>
        </AuthCard>
      )}

      {/* VIEW 4: FORGOT PASSWORD */}
      {view === 'FORGOT' && (
        <AuthCard
          title={t.auth.forgotTitle}
          subtitle={t.auth.forgotSubtitle}
          showTabs={false}
          showBack={true}
          onBack={() => setView('LOGIN')}
          onClose={onClose}
          secureNote={t.auth.secureNote}
        >
          {errors.general && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#ef3b2d] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-5">
            <PhoneOrEmailInput
              label={t.auth.phoneLabel}
              placeholder={t.auth.phonePlaceholder}
              value={phone}
              onChange={(val) => {
                setPhone(val);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
              }}
              error={errors.phone}
              isValid={validatePhone(phone)}
              autoFocus
            />

            <AuthSubmitButton
              label={t.auth.sendOtpBtn}
              loading={isLoading}
            />
          </form>
        </AuthCard>
      )}

      {/* VIEW 5: NEW PASSWORD (AFTER FORGOT OTP) */}
      {view === 'NEW_PASSWORD' && (
        <AuthCard
          title="Yangi parol o'rnatish"
          subtitle={`${phone} raqamiga yuborilgan tasdiqlash kodi va yangi parolni kiriting`}
          showTabs={false}
          showBack={true}
          onBack={() => setView('FORGOT')}
          onClose={onClose}
          secureNote={t.auth.secureNote}
        >
          {errors.general && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-[#ef3b2d] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#12935a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <OtpInput
              value={otpCode}
              onChange={(code) => setOtpCode(code)}
              error={errors.otp}
              resendCountdown={countdown}
              onResend={async () => {
                const res = await requestOtp(phone);
                if (res.success) setCountdown(59);
              }}
              labels={{
                resendCode: t.auth.resendCode,
                resendIn: t.auth.resendIn,
                demoNote: t.auth.demoOtpNote,
              }}
            />

            <PasswordInput
              label="Yangi parol"
              value={password}
              onChange={(val) => setPassword(val)}
              error={errors.password}
              isValid={password.length >= 6}
              showStrengthMeter
            />

            <PasswordInput
              label="Parolni tasdiqlang"
              value={confirmPassword}
              onChange={(val) => setConfirmPassword(val)}
              error={errors.confirmPassword}
              isValid={confirmPassword.length >= 6 && confirmPassword === password}
            />

            <AuthSubmitButton
              label={t.auth.resetPasswordBtn}
              loading={isLoading}
            />
          </form>
        </AuthCard>
      )}

      {/* VIEW 6: TELEGRAM LOGIN */}
      {view === 'TELEGRAM' && (
        <AuthCard
          title="Telegram orqali kirish"
          subtitle={`@${tgBotUsername} orqali 1 soniyada xavfsiz va parolsiz kiring`}
          showTabs={false}
          onClose={onClose}
          secureNote="Telegram 256-bit xavfsizlik protokoli orqali kafolatlangan"
        >
          <div className="space-y-4">
            {/* Success or Error messages */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
            {errors.general && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Main Action 1: Open Bot Deep Link */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#229ED9]/10 via-[#229ED9]/5 to-transparent border-2 border-[#229ED9]/30 text-center relative overflow-hidden shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#229ED9] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#229ED9]/30">
                <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-1.97 9.28c-.15.65-.53.81-1.07.51l-2.98-2.2-1.44 1.39c-.16.16-.3.3-.61.3l.21-3.05 5.56-5.02c.24-.22-.05-.34-.38-.13l-6.87 4.33-2.96-.92c-.64-.2-.66-.64.13-.95l11.58-4.46c.54-.2 1.01.12.83.92z" />
                </svg>
              </div>

              <h4 className="font-unbounded font-black text-sm text-[#10152b] mb-1">
                Telegram Bot bilan 1-Bosqichda Ulanish
              </h4>
              <p className="text-[11px] text-[#4a5068] font-bold mb-4">
                Tugmani bosing va botda <b>Start</b> ni bosing. Sayt avtomatik ochiladi!
              </p>

              <a
                href={tgDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-[#229ED9] hover:bg-[#1d8bc0] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#229ED9]/30 transition-all transform active:scale-95 cursor-pointer"
              >
                <span>🤖 Telegram Botni Ochish (@{tgBotUsername})</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Real-time sync indicator */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#229ED9] font-extrabold mt-3 pt-2 border-t border-[#229ED9]/20">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Botda tasdiqlash kutilmoqda... (Avtomatik ulanadi)</span>
              </div>
            </div>

            {/* Option 2: Quick Username / ID input */}
            <div className="pt-2">
              <div className="relative flex items-center justify-center mb-3">
                <div className="border-t border-[#eadfc9] w-full" />
                <span className="bg-white px-3 text-[10px] font-black text-[#7a7f95] uppercase tracking-wider whitespace-nowrap absolute">
                  yoki tezkor kiring
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="@username yoki Telegram ID"
                  value={tgIdentifier}
                  onChange={(e) => setTgIdentifier(e.target.value)}
                  className="flex-1 bg-[#faf6ee] border border-[#eadfc9] rounded-full px-4 py-2.5 text-xs font-bold text-[#10152b] focus:outline-none focus:border-[#229ED9] transition placeholder:text-[#7a7f95]"
                />
                <button
                  type="button"
                  onClick={handleQuickTelegramLogin}
                  disabled={tgLoading}
                  className="px-5 py-2.5 rounded-full bg-[#10152b] hover:bg-[#229ED9] text-white text-xs font-black transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {tgLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Kirish</span>
                </button>
              </div>
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={() => setView('LOGIN')}
              className="w-full py-2.5 text-xs text-[#7a7f95] hover:text-[#10152b] font-extrabold transition cursor-pointer text-center"
            >
              ← Telefon yoki parol orqali kirish
            </button>
          </div>
        </AuthCard>
      )}
    </AuthLayout>
  );
};
