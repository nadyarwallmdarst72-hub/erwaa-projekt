import React, { useState } from 'react';
import { OWNER_EMAIL } from '../types';
import { Mail, KeyRound, CheckCircle2, ArrowRight, X, Sparkles, Copy, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendOtp: (email: string) => string;
  onVerify: (email: string, code: string, name?: string) => { success: boolean; error?: string };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSendOtp,
  onVerify,
}) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [activeOtp, setActiveOtp] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  if (!isOpen) return null;

  const handleSendCode = (targetEmail?: string) => {
    const emailToUse = (targetEmail || email).trim().toLowerCase();
    if (!emailToUse || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      setErrorMsg('الرجاء إدخال بريد إلكتروني صحيح.');
      return;
    }

    setErrorMsg('');
    const generatedCode = onSendOtp(emailToUse);
    setActiveOtp(generatedCode);
    if (targetEmail) {
      setEmail(targetEmail);
    }
    setStep('code');
    setResendTimer(30);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('الرجاء كتابة رمز التحقق.');
      return;
    }

    const res = onVerify(email, code.trim(), name.trim());
    if (res.success) {
      onClose();
      // Reset form
      setStep('email');
      setEmail('');
      setName('');
      setCode('');
      setErrorMsg('');
    } else {
      setErrorMsg(res.error || 'رمز التحقق غير صحيح.');
    }
  };

  const handleUseOwnerQuickLogin = () => {
    setEmail(OWNER_EMAIL);
    setName('نادية الرويلي');
    handleSendCode(OWNER_EMAIL);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-[440px] bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-2xl animate-slide-up grid gap-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-[var(--fg)] m-0 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--accent)]" />
              {step === 'email' ? 'تسجيل الدخول / إنشاء حساب' : 'تأكيد رمز التحقق'}
            </h3>
            <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
              {step === 'email'
                ? 'أدخل بريدك الإلكتروني لتصلك رسالة تحقق برمز الدخول'
                : `تم إرسال رمز التحقق إلى: ${email}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--line)]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Enter Email */}
        {step === 'email' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendCode();
            }}
            className="grid gap-3.5"
          >
            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              البريد الإلكتروني
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
                autoFocus
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              الاسم الكامل (اختياري - للشهادات والملف الشخصي)
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: نادية عبد الله"
                className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </label>

            {/* Quick Owner Login Shortcut */}
            <div className="p-3 rounded-xl bg-[var(--accent-soft)]/50 border border-[var(--line)] flex items-center justify-between gap-2">
              <div className="min-w-0 text-xs">
                <span className="font-bold flex items-center gap-1 text-[var(--accent)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  حساب مالك الموقع
                </span>
                <span className="text-[11px] text-[var(--muted)] truncate block" dir="ltr">
                  {OWNER_EMAIL}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseOwnerQuickLogin}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs flex-shrink-0"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                دخول كمالك
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold m-0 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 mt-1"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              إرسال رمز التحقق
            </button>
          </form>
        )}

        {/* STEP 2: Enter Verification Code */}
        {step === 'code' && (
          <form onSubmit={handleVerify} className="grid gap-3.5">
            {/* Simulated Inbox Delivery Notification Banner */}
            {activeOtp && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 grid gap-2 animate-slide-up">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    وصلتك رسالة تحقق جديدة
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">الآن</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-black/40 border border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[var(--muted)] block">رمز التحقق الخاص بك هو:</span>
                    <span className="text-xl font-bold font-mono tracking-widest text-[var(--fg)]">
                      {activeOtp}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCode(activeOtp)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    استخدام الرمز
                  </button>
                </div>
              </div>
            )}

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              أدخل الرمز المكون من 6 أرقام
              <input
                type="text"
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="px-3.5 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-center text-xl font-mono tracking-widest text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                autoFocus
                required
              />
            </label>

            {errorMsg && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold m-0 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </p>
            )}

            <div className="grid gap-2 pt-1">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                تأكيد الدخول
              </button>

              <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setErrorMsg('');
                  }}
                  className="hover:text-[var(--fg)] flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  تعديل البريد الإلكتروني
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => handleSendCode()}
                  className="font-semibold text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
                >
                  {resendTimer > 0 ? `إعادة الإرسال بعد (${resendTimer} ثانية)` : 'إعادة إرسال الرمز'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
