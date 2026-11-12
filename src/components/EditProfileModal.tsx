import React, { useState, useEffect } from 'react';
import { UserAccount, OWNER_EMAIL } from '../types';
import { User, Phone, FileText, CheckCircle2, X, ShieldCheck, UserCheck, GraduationCap, KeyRound, Send, Eye, EyeOff } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateProfile: (updates: Partial<UserAccount>) => void;
  onRequestChangeCode?: (requestedCode: string, note?: string) => void;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=AhmedOwner',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Reem',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Fawaz',
  'https://api.dicebear.com/7.x/bottts/svg?seed=TeacherA',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onRequestChangeCode,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [accountCode, setAccountCode] = useState(currentUser.accountCode || '');
  const [showCode, setShowCode] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar || AVATAR_OPTIONS[0]);

  // Request code change state
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [requestedNewCode, setRequestedNewCode] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [requestSentSuccess, setRequestSentSuccess] = useState(false);

  useEffect(() => {
    setName(currentUser.name || '');
    setBio(currentUser.bio || '');
    setPhone(currentUser.phone || '');
    setAccountCode(currentUser.accountCode || '');
    setSelectedAvatar(currentUser.avatar || AVATAR_OPTIONS[0]);
    setIsRequestingCode(false);
    setRequestedNewCode('');
    setRequestNote('');
    setRequestSentSuccess(false);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      avatar: selectedAvatar,
      ...(accountCode.trim().length >= 4 ? { accountCode: accountCode.trim() } : {}),
    });
    onClose();
  };

  const handleSendCodeRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!requestedNewCode.trim() || requestedNewCode.trim().length < 4) {
      alert('يجب أن يتكون الرمز الجديد المطلوب من 4 خانات على الأقل.');
      return;
    }
    if (onRequestChangeCode) {
      onRequestChangeCode(requestedNewCode.trim(), requestNote.trim());
      setRequestSentSuccess(true);
      setTimeout(() => {
        setIsRequestingCode(false);
        setRequestSentSuccess(false);
      }, 2500);
    }
  };

  const isOwner = currentUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[440px] bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 shadow-2xl animate-slide-up grid gap-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div>
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--accent)]" />
              تعديل بيانات الحساب
            </h3>
            <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
              تحديث ملفك الشخصي واسمك المعتمد في الشهادات
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Header */}
        <div className="p-3 rounded-2xl bg-[var(--accent-soft)]/40 border border-[var(--line)] flex items-center gap-3">
          <img
            src={selectedAvatar}
            alt={name}
            className="w-12 h-12 rounded-full border-2 border-white shadow-xs object-cover bg-white"
          />
          <div className="min-w-0">
            <span className="font-bold text-sm text-[var(--fg)] block truncate">
              {name || 'بدون اسم'}
            </span>
            <span className="text-xs text-[var(--muted)] font-mono block truncate" dir="ltr">
              {currentUser.email}
            </span>
            <span className="text-[11px] font-bold mt-0.5 inline-flex items-center gap-1">
              {isOwner ? (
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  مالك الموقع
                </span>
              ) : currentUser.role === 'teacher' ? (
                <span className="text-blue-600 flex items-center gap-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  معلم مشرف
                </span>
              ) : (
                <span className="text-teal-600 flex items-center gap-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  طالب بالمنصة
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Choose Avatar */}
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] mb-2">
            اختر الصورة الرمزية:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {AVATAR_OPTIONS.map((avUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAvatar(avUrl)}
                className={`w-10 h-10 rounded-full border-2 p-0.5 flex-shrink-0 transition-transform ${
                  selectedAvatar === avUrl
                    ? 'border-[var(--accent)] scale-110 shadow-xs'
                    : 'border-[var(--line)] hover:scale-105 opacity-70'
                }`}
              >
                <img
                  src={avUrl}
                  alt={`رمز ${idx + 1}`}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name input */}
        <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
          الاسم الكامل
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: أحمد عبد الله"
            className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
          />
        </label>

        {/* Bio input */}
        <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
          نبذة تعريفية أو التخصص الأكاديمي
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="اكتب نبذة مختصرة عن اهتماماتك أو مؤهلاتك..."
            className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </label>

        {/* Phone input */}
        <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
          رقم الهاتف / التواصل (اختياري)
          <input
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+966 5X XXX XXXX"
            className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </label>

        {/* Account Code Section with Toggle & Request to Manager */}
        <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)]/50 grid gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--fg)] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>الرمز الخاص بالحساب (لتسجيل الدخول)</span>
            </span>
            <span className="text-[10px] text-[var(--muted)] font-normal">
              4 خانات على الأقل
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type={showCode ? 'text' : 'password'}
              dir="ltr"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              placeholder="الرمز الخاص بك"
              className="w-full pr-3.5 pl-10 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--fg)] font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute left-2.5 text-[var(--muted)] hover:text-[var(--fg)] p-1 rounded-md transition-colors"
              title={showCode ? 'إخفاء الرمز' : 'إظهار الرمز'}
            >
              {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Student Request to Manager Option */}
          {!isOwner && (
            <div className="pt-1 border-t border-[var(--line)]/60">
              {!isRequestingCode ? (
                <button
                  type="button"
                  onClick={() => setIsRequestingCode(true)}
                  className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <Send className="w-3 h-3" />
                  <span>طلب تعديل / تغيير الرمز من قِبل إدارة المنصة</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] grid gap-2 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 text-[var(--accent)]" />
                      طلب تغيير الرمز الخاص من المدير
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRequestingCode(false)}
                      className="text-[11px] text-[var(--muted)] hover:text-[var(--fg)]"
                    >
                      إلغاء الطلب
                    </button>
                  </div>

                  {requestSentSuccess ? (
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>تم إرسال طلبك إلى مالك المنصة بنجاح! سيتم اعتماده وتحديث رمزك.</span>
                    </div>
                  ) : (
                    <>
                      <label className="grid gap-1 text-[11px] text-[var(--muted)] font-semibold">
                        الرمز الجديد المقترح:
                        <input
                          type="text"
                          dir="ltr"
                          value={requestedNewCode}
                          onChange={(e) => setRequestedNewCode(e.target.value)}
                          placeholder="مثال: 9876 أو mySecretCode"
                          className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] font-mono"
                        />
                      </label>

                      <label className="grid gap-1 text-[11px] text-[var(--muted)] font-semibold">
                        سبب أو ملاحظة الطلب (اختياري):
                        <input
                          type="text"
                          value={requestNote}
                          onChange={(e) => setRequestNote(e.target.value)}
                          placeholder="مثال: نسيت رمزي السابق أو أريد رمزاً أسهل للحفظ"
                          className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleSendCodeRequest}
                        className="mt-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال الطلب للمدير</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            حفظ التغييرات
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};
