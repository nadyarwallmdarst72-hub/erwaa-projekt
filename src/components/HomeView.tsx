import React from 'react';
import { SiteSettings, Course, Lesson, Student, Certificate, UserAccount } from '../types';
import {
  LogIn,
  UserPlus,
  BookOpen,
  CalendarDays,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Settings,
  GraduationCap,
  FileCheck,
  ShieldCheck,
  PhoneCall,
  Clock,
  Compass,
  Star,
} from 'lucide-react';

interface HomeViewProps {
  site: SiteSettings;
  courses: Course[];
  lessons: Lesson[];
  students: Student[];
  certificates: Certificate[];
  currentUser: UserAccount | null;
  isOwner: boolean;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onNavigateTab: (tab: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  site,
  courses,
  lessons,
  students,
  certificates,
  currentUser,
  isOwner,
  onOpenAuthModal,
  onNavigateTab,
}) => {
  const clubImage =
    site.clubImage ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';

  const clubAbout =
    site.clubAbout ||
    site.welcomeText ||
    'نادي وأكاديمية إرواء هو صرح تعليمي وتدريبي رائد يهدف إلى تأهيل الطلاب والمتدربين بالمهارات البرمجية والتقنية الحديثة، عبر مسارات عملية، ومشاريع واقعية، وإشراف نخبة من المعلمين المعتمدين.';

  const clubFeatures = site.clubFeatures && site.clubFeatures.length > 0
    ? site.clubFeatures
    : [
        'محاضرات تفاعلية مع تسجيل الحضور ومتابعة تقدم الطلاب',
        'تطبيقات وتمارين عملية مكثفة مرافقة لكل محاضرة',
        'اختبارات تقييمية مستمرة ومشاريع برمجية خاضعة للتقييم',
        'شهادات إتمام وتفوق موثقة برقم تسلسلي معتمد',
        'منتدى متكامل للأسئلة العلمية والنقاشات وتبادل الخبرات',
        'مساعد ذكي للإدارة للمساعدة في إعداد المحتوى والتوجيه',
      ];

  const totalExercises = lessons.reduce((acc, l) => acc + (l.exercises?.length || 0), 0);

  return (
    <div className="grid gap-6 animate-fade-in pb-10">
      {/* Owner Customization Notice */}
      {isOwner && (
        <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">مرحباً بك يا مالك المنصة!</span>
              <span className="opacity-90">
                يمكنك تعديل صورة النادي، النبذة التعريفية، الألوان، والمميزات مباشرة من لوحة الإدارة وسيتزامن فوراً مع جميع الأجهزة.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('admin')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>تعديل معلومات النادي</span>
          </button>
        </div>
      )}

      {/* Hero Banner Section with Club Image */}
      <section className="relative rounded-3xl overflow-hidden border border-[var(--line)] bg-[var(--surface)] shadow-sm">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900">
          <img
            src={clubImage}
            alt={site.name}
            className="w-full h-full object-cover object-center opacity-70 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/60 to-transparent" />

          {/* Floating Brand Badge */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{site.name || 'إرواء'} · النادي والأكاديمية</span>
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative -mt-24 sm:-mt-28 px-4 sm:px-8 pb-8 pt-4">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold mb-3 border border-[var(--accent)]/20 shadow-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>{site.welcomeTitle || 'مرحباً بك في نادي وأكاديمية إرواء'}</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--fg)] tracking-tight font-display mb-3">
              {site.name} — {site.tagline || 'المنصة التعليمية والأكاديمية المتكاملة'}
            </h1>

            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-body mb-6">
              {site.welcomeText || clubAbout}
            </p>

            {/* Auth CTA / Personalized Greeting */}
            {!currentUser ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg)] border-2 border-[var(--line)] shadow-sm grid gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg)]">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>انضم إلينا اليوم وابدأ رحلتك الأكاديمية والتدريبية</span>
                </div>
                <p className="text-xs text-[var(--muted)] m-0 leading-relaxed">
                  سجّل دخولك الآن أو أنشئ حساباً جديداً للانضمام لمسارات النادي، تسجيل حضور المحاضرات، حل الاختبارات والتطبيقات العملية، والحصول على شهادتك الرسمية المعتمدة.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('login')}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md flex items-center gap-2 transition-all hover:opacity-95"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('register')}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border-2 border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)] hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء حساب جديد</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {currentUser.name ? currentUser.name.slice(0, 1) : 'م'}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--fg)] m-0">
                      أهلاً بك مجدداً، {currentUser.name}!
                    </h3>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                      {isOwner
                        ? 'أنت متصل بصفتك مالك المنصة ومسؤول النادي'
                        : currentUser.role === 'teacher'
                        ? 'أنت متصل بصفتك معلماً ومشرفاً أكاديمياً'
                        : 'أنت متصل كطالب مسجل في النادي'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('cal')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>جدول المحاضرات والتقويم</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('courses')}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>المقررات</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-[var(--fg)] block font-display">
              {courses.length}
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">مقررات ودورات</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-[var(--fg)] block font-display">
              {lessons.length}
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">محاضرات ودروس</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-[var(--fg)] block font-display">
              {totalExercises || lessons.length}
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">تمارين وتطبيقات</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-2xl font-black text-[var(--fg)] block font-display">
              {certificates.length}
            </span>
            <span className="text-xs text-[var(--muted)] font-medium">شهادات صادرة</span>
          </div>
        </div>
      </section>

      {/* About The Club Section */}
      <section className="p-5 sm:p-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div>
            <span className="text-xs font-bold text-[var(--accent)] block mb-1">
              رسالتنا وأهدافنا
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--fg)] m-0">
              عن نادي وأكاديمية {site.name}
            </h2>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={() => onNavigateTab('admin')}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>تعديل هذا النص من لوحة الإدارة</span>
            </button>
          )}
        </div>

        <p className="text-sm sm:text-base text-[var(--fg)]/90 leading-relaxed m-0 font-body whitespace-pre-line">
          {clubAbout}
        </p>

        {/* Club Features / Activities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {clubFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] flex items-start gap-2.5 transition-all hover:border-[var(--accent)]/40"
            >
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {idx + 1}
              </span>
              <span className="text-xs font-semibold text-[var(--fg)] leading-relaxed">
                {feat}
              </span>
            </div>
          ))}
        </div>

        {site.clubContact && (
          <div className="mt-2 pt-4 border-t border-[var(--line)] flex items-center gap-2 text-xs text-[var(--muted)]">
            <PhoneCall className="w-4 h-4 text-[var(--accent)]" />
            <span>معلومات التواصل: {site.clubContact}</span>
          </div>
        )}
      </section>

      {/* Featured Courses Showcase */}
      {courses.length > 0 && (
        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--fg)] m-0">
                المسارات والدورات المتاحة
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                تصفح المقررات الدراسية والتحق بما يناسب اهتماماتك
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('courses')}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>عرض جميع الدورات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 3).map((c) => {
              const courseLessons = lessons.filter((l) => l.courseId === c.id);
              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md hover:border-[var(--accent)]/50"
                >
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                        {c.type === 'subject' ? 'مادة دراسية' : 'دورة تدريبية'}
                      </span>
                      {c.teacher && (
                        <span className="text-[11px] text-[var(--muted)] font-medium">
                          المشرف: {c.teacher}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-[var(--fg)] font-display m-0">
                      {c.title}
                    </h4>
                    {c.desc && (
                      <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed m-0">
                        {c.desc}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--line)]/60 flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)] flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {courseLessons.length} دروس
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('courses')}
                      className="font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                    >
                      <span>التفاصيل والتسجيل</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
