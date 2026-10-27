import React, { useState } from 'react';
import { Mail, KeyRound, User, Lock, Eye, EyeOff, AlertCircle, X, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, code: string, rememberMe: boolean) => { success: boolean; error?: string };
  onRegister: (email: string, code: string, name: string, rememberMe: boolean) => { success: boolean; error?: string };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [name, setName] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setCode('');
    setConfirmCode('');
    setName('');
    setErrorMsg('');
    setShowCode(false);
    setRememberMe(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('الرجاء إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (!cleanCode) {
      setErrorMsg('الرجاء إدخال رمز الحساب.');
      return;
    }

    const res = onLogin(cleanEmail, cleanCode, rememberMe);
    if (res.success) {
      handleClose();
    } else {
      setErrorMsg(res.error || 'فشل تسجيل الدخول، يرجى التحقق من صحة البيانات.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMsg('الرجاء إدخال الاسم الكامل.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('الرجاء إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (!cleanCode || cleanCode.length < 4) {
      setErrorMsg('يجب أن يتكون رمز الحساب من 4 خانات على الأقل.');
      return;
    }
    if (cleanCode !== confirmCode.trim()) {
      setErrorMsg('رمزا الحساب غير متطابقين، يرجى التأكد وإعادة المحاولة.');
      return;
    }

    const res = onRegister(cleanEmail, cleanCode, cleanName, rememberMe);
    if (res.success) {
      handleClose();
    } else {
      setErrorMsg(res.error || 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-[440px] bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-2xl animate-slide-up grid gap-4"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold font-display text-[var(--fg)] m-0 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
              {mode === 'login' ? 'تسجيل الدخول للمنصة' : 'إنشاء حساب جديد'}
            </h3>
            <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
              {mode === 'login'
                ? 'أدخل بريدك الإلكتروني ورمز حسابك السري للدخول'
                : 'أنشئ حسابك وحدد رمز الدخول الخاص بك (يُمنع تكرار الحسابات)'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--line)]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--surface)] text-[var(--fg)] shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-[var(--surface)] text-[var(--fg)] shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            إنشاء حساب جديد
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="grid gap-3.5">
            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                البريد الإلكتروني
              </span>
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
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  رمز الحساب السري
                </span>
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 font-normal"
                >
                  {showCode ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      إخفاء الرمز
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      إظهار الرمز
                    </>
                  )}
                </button>
              </div>
              <input
                type={showCode ? 'text' : 'password'}
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="أدخل رمز حسابك السري"
                className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
                required
              />
            </label>

            {/* Auto-save / Remember login checkbox */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] cursor-pointer select-none transition-colors hover:border-[var(--accent)]/50">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[var(--accent)] accent-[var(--accent)] cursor-pointer flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[var(--fg)]">
                    تشغيل الحفظ التلقائي على هذا الجهاز
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    مستحسن
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5 leading-snug">
                  البقاء مسجلاً في الموقع تلقائياً دون الحاجة لإعادة إدخال الرمز عند الرجوع.
                </p>
              </div>
            </label>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 mt-1 cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <LogIn className="w-4 h-4" />
              دخول إلى حسابي
            </button>

            <div className="text-center text-xs text-[var(--muted)] pt-1">
              ليس لديك حساب بعد؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="font-bold text-[var(--accent)] hover:underline"
              >
                إنشاء حساب جديد الآن
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="grid gap-3.5">
            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                الاسم الكامل (لإصدار الشهادات الرسمية)
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي"
                className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
                autoFocus
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                البريد الإلكتروني
              </span>
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  إنشاء رمز الحساب
                </span>
                <input
                  type={showCode ? 'text' : 'password'}
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="4 خانات على الأقل"
                  className="px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
                  required
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  تأكيد رمز الحساب
                </span>
                <input
                  type={showCode ? 'text' : 'password'}
                  dir="ltr"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="أعد كتابة الرمز"
                  className="px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
                  required
                />
              </label>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--fg)] flex items-center gap-1"
              >
                {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showCode ? 'إخفاء الرموز' : 'إظهار الرموز'}
              </button>
              <span className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                محمي من التكرار بحسابات متعددة
              </span>
            </div>

            {/* Auto-save / Remember login checkbox */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] cursor-pointer select-none transition-colors hover:border-[var(--accent)]/50">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[var(--accent)] accent-[var(--accent)] cursor-pointer flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[var(--fg)]">
                    تشغيل الحفظ التلقائي على هذا الجهاز
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    مستحسن
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] m-0 mt-0.5 leading-snug">
                  حفظ جلستي تلقائياً والدخول مباشرة عند فتح المنصة لاحقاً.
                </p>
              </div>
            </label>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95 mt-1 cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <UserPlus className="w-4 h-4" />
              إنشاء الحساب والتسجيل
            </button>

            <div className="text-center text-xs text-[var(--muted)] pt-1">
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="font-bold text-[var(--accent)] hover:underline"
              >
                تسجيل الدخول برمزك
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
