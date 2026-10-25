import React, { useState } from 'react';
import {
  SiteSettings,
  Course,
  Lesson,
  Announcement,
  AttendanceRecord,
} from '../types';
import {
  padZero,
  formatDateKey,
  parseDateKey,
  formatLongDate,
  formatDateTime,
  AR_LOCALE,
} from '../storage';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  ExternalLink,
  PlayCircle,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileCheck,
} from 'lucide-react';
import { LessonExercise } from '../types';

interface CalendarViewProps {
  site: SiteSettings;
  courses: Course[];
  lessons: Lesson[];
  blocks: Announcement[];
  enrolled: Record<string, { at: number }>;
  attendance: Record<string, AttendanceRecord>;
  onSaveAttendance: (lessonId: string, attended: boolean) => void;
  onOpenLesson: (lessonId: string) => void;
  onNavigateTab: (tab: any) => void;
}

const ExerciseItemRow: React.FC<{
  exercise: LessonExercise;
  index: number;
  lessonId: string;
}> = ({ exercise, index, lessonId }) => {
  const [completed, setCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`ex_${lessonId}_${exercise.id || index}`) === 'true';
    } catch {
      return false;
    }
  });
  const [showHint, setShowHint] = useState<boolean>(false);

  const toggleCompleted = () => {
    const next = !completed;
    setCompleted(next);
    try {
      localStorage.setItem(`ex_${lessonId}_${exercise.id || index}`, String(next));
    } catch {}
  };

  return (
    <div
      className={`p-3 rounded-xl border transition-all text-xs ${
        completed
          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-[var(--surface)] border-[var(--line)]'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <label className="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            checked={completed}
            onChange={toggleCompleted}
            className="mt-0.5 w-4 h-4 rounded text-[var(--accent)] accent-[var(--accent)] cursor-pointer flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[var(--fg)] text-xs">
                تمرين {index}: {exercise.title}
              </span>
              {completed && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                  مكتمل ✓
                </span>
              )}
            </div>
            {exercise.description && (
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed whitespace-pre-line m-0">
                {exercise.description}
              </p>
            )}
          </div>
        </label>
      </div>

      {exercise.solutionHint && (
        <div className="mt-2.5 pt-2 border-t border-[var(--line)]/60">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'إخفاء التلميح والحل' : 'إظهار التلميح أو الحل النموذجي'}</span>
            {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showHint && (
            <div className="mt-2 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line animate-fade-in">
              <strong className="block mb-0.5">التلميح أو الإجابة النموذجية:</strong>
              {exercise.solutionHint}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  site,
  courses,
  lessons,
  blocks,
  enrolled,
  attendance,
  onSaveAttendance,
  onOpenLesson,
  onNavigateTab,
}) => {
  const today = new Date();
  const todayKey = formatDateKey(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);
  const [activeSheetLessonId, setActiveSheetLessonId] = useState<string | null>(null);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedKey(todayKey);
  };

  const isVisibleForStudent = (item: { courseId?: string }) => {
    if (!item.courseId) return true;
    return !!enrolled[item.courseId];
  };

  const enrolledLessons = lessons.filter(isVisibleForStudent);

  const getLessonsOnDate = (dateKey: string) => {
    return enrolledLessons
      .filter((l) => l.date === dateKey)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || a.title.localeCompare(b.title, 'ar'));
  };

  const isAttended = (lessonId: string) => {
    return !!attendance[lessonId]?.attended;
  };

  const getDayState = (dateKey: string) => {
    const dayLessons = getLessonsOnDate(dateKey);
    if (!dayLessons.length) return 'none';
    const allAttended = dayLessons.every((l) => isAttended(l.id));
    if (allAttended) return 'done';
    if (dateKey < todayKey) return 'missed';
    return dateKey === todayKey ? 'todayopen' : 'upcoming';
  };

  // Calendar matrix calculation
  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Saturday start offset in RTL Arab world: Saturday is 6 in JS Sunday=0, or (getDay()+1)%7
  const startOffset = (firstDay.getDay() + 1) % 7;

  const weekdays = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

  // Attendance summary metrics
  const dueLessons = enrolledLessons.filter((l) => l.date <= todayKey);
  const attendedCount = dueLessons.filter((l) => isAttended(l.id)).length;
  const attendancePct = dueLessons.length
    ? Math.round((attendedCount * 100) / dueLessons.length)
    : 0;

  // Selected date lessons
  const selectedDateLessons = getLessonsOnDate(selectedKey);

  // Continue watching lessons: opened but not yet marked attended
  const continueWatching = enrolledLessons
    .filter((l) => {
      const log = attendance[l.id];
      return log?.opened && !log?.attended;
    })
    .sort((a, b) => (attendance[b.id]?.opened || 0) - (attendance[a.id]?.opened || 0));

  // Active sheet lesson
  const sheetLesson = lessons.find((l) => l.id === activeSheetLessonId);
  const courseOfLesson = (cid: string) => courses.find((c) => c.id === cid);

  // Helper to extract YouTube video embed ID
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
  };

  return (
    <div className="space-y-4">
      {/* Welcome & Announcements Banner */}
      {(site.welcomeTitle || site.welcomeText) && (
        <div
          className="p-4 rounded-2xl border border-[var(--line)] shadow-xs transition-all"
          style={{
            backgroundColor: 'var(--accent-soft)',
          }}
        >
          {site.welcomeTitle && (
            <h3
              className="text-lg font-bold font-display mb-1 flex items-center gap-2"
              style={{ color: 'var(--accent)' }}
            >
              <Sparkles className="w-5 h-5 flex-shrink-0" />
              {site.welcomeTitle}
            </h3>
          )}
          {site.welcomeText && (
            <p className="text-sm m-0 leading-relaxed text-[var(--fg)] opacity-90 whitespace-pre-line font-body">
              {site.welcomeText}
            </p>
          )}
        </div>
      )}

      {/* Main Responsive Grid: Stacks on mobile portrait, side-by-side on landscape/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Main Column: Calendar & Continue Watching */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Calendar Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
            {/* Month Selector */}
            <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
          <h2 className="text-base font-bold font-display m-0 flex-1">
            {new Date(currentYear, currentMonth, 1).toLocaleDateString(AR_LOCALE, {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
              aria-label="الشهر السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
              aria-label="الشهر التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={jumpToToday}
              className="ms-1 px-3 py-1 rounded-lg border border-[var(--accent)] text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
            >
              اليوم
            </button>
          </div>
        </div>

        {/* Days Grid */}
        <div className="p-3">
          <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-[var(--muted)] font-medium mb-1">
            {weekdays.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 place-items-center">
            {/* Blank leading slots */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <span key={`blank-${i}`} className="w-10 h-10" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(dayNum)}`;
              const state = getDayState(dateKey);
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedKey;

              let ringStyle = 'border-transparent';
              if (state === 'done') ringStyle = 'border-[var(--ok)] border-2';
              if (state === 'missed') ringStyle = 'border-[var(--bad)] border-2';

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedKey(dateKey)}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all border ${ringStyle} ${
                    isSelected ? 'bg-[var(--accent-soft)] font-bold' : ''
                  } ${isToday ? 'text-[var(--accent)] font-bold' : 'text-[var(--fg)]'}`}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--accent-soft)'
                      : undefined,
                  }}
                  aria-label={formatLongDate(dateKey)}
                >
                  <span>{dayNum}</span>
                  {/* Dot for today/upcoming */}
                  {(state === 'upcoming' || state === 'todayopen') && (
                    <span
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-xs text-[var(--muted)] border-t border-[var(--line)]/60 bg-[var(--surface)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-[var(--ok)]" />
            حضرت دروس اليوم
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-[var(--bad)]" />
            فاتك درس
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            درس قادم
          </span>
        </div>

        {/* Attendance Summary */}
        <div className="flex items-center justify-between gap-3 p-3.5 border-t border-[var(--line)] bg-[var(--accent-soft)]/20 text-xs sm:text-sm">
          <span>
            حضرت <b className="font-bold">{attendedCount}</b> من{' '}
            <b className="font-bold">{dueLessons.length}</b> درس حتى اليوم
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-[var(--accent-soft)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${attendancePct}%`,
                  backgroundColor: 'var(--accent)',
                }}
              />
            </div>
            <span className="font-bold text-xs" style={{ color: 'var(--accent)' }}>
              {attendancePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
            <h3 className="font-bold text-base m-0 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent)]" />
              تابع المشاهدة
            </h3>
            <span className="text-xs text-[var(--muted)]">
              {continueWatching.length === 1
                ? 'درس واحد'
                : `${continueWatching.length} دروس قيد المتابعة`}
            </span>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {continueWatching.map((l) => {
              const course = courseOfLesson(l.courseId);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    onOpenLesson(l.id);
                    setActiveSheetLessonId(l.id);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 text-right hover:bg-[var(--accent-soft)]/40 transition-colors cursor-pointer group"
                >
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm m-0 truncate text-[var(--fg)]">
                      {l.title}
                    </h4>
                    <p className="text-xs text-[var(--muted)] m-0 truncate">
                      {course?.title || 'عام'} · {formatLongDate(l.date)}
                    </p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>

    {/* Side Column: Selected Day Lessons & Announcements */}
    <div className="lg:col-span-5 xl:col-span-4 space-y-4">
      {/* Selected Day's Lessons List */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
          <h3 className="font-bold text-base m-0 font-display">دروس هذا اليوم</h3>
          <span className="text-xs text-[var(--muted)]">{formatLongDate(selectedKey)}</span>
        </div>

        {selectedDateLessons.length > 0 ? (
          <div className="divide-y divide-[var(--line)]">
            {selectedDateLessons.map((l) => {
              const attended = isAttended(l.id);
              const course = courseOfLesson(l.courseId);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    onOpenLesson(l.id);
                    setActiveSheetLessonId(l.id);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 text-right hover:bg-[var(--accent-soft)]/40 transition-colors cursor-pointer group"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      attended
                        ? 'text-white'
                        : 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    }`}
                    style={{
                      backgroundColor: attended ? 'var(--accent)' : undefined,
                    }}
                  >
                    {attended ? <Check className="w-4 h-4 stroke-[2.5]" /> : <PlayCircle className="w-4 h-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm m-0 truncate text-[var(--fg)]">
                      {l.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-[var(--muted)] m-0 truncate">
                        {course?.title || 'عام'}
                      </p>
                      {l.exercises && l.exercises.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-semibold flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          {l.exercises.length} {l.exercises.length === 1 ? 'تمرين' : 'تمارين'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-[var(--muted)]">
            {Object.keys(enrolled).length ? (
              <p className="m-0">لا توجد دروس مقررة في هذا اليوم.</p>
            ) : (
              <div>
                <p className="m-0 mb-3">لم تسجّل في أي دورة بعد لتظهر لك الدروس.</p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('courses')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  تصفّح الدورات والتسجيل
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Announcements */}
      {blocks.filter(isVisibleForStudent).map((b) => (
        <div
          key={b.id}
          className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-2"
        >
          <h4 className="font-bold text-base m-0 text-[var(--fg)] font-display">
            {b.title}
          </h4>
          {b.text && (
            <p className="text-sm text-[var(--muted)] m-0 whitespace-pre-line font-body leading-relaxed">
              {b.text}
            </p>
          )}
          {b.linkUrl && (
            <div>
              <a
                href={b.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
              >
                <span>{b.linkLabel || 'افتح الرابط'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>

      {/* Lesson Details Bottom Sheet / Modal */}
      {sheetLesson && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveSheetLessonId(null)}
          />
          <div
            className="relative z-10 w-full max-w-[540px] bg-[var(--surface)] border border-[var(--line)] rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl max-h-[88dvh] overflow-y-auto animate-slide-up grid gap-3.5"
            role="dialog"
            aria-modal="true"
            aria-label={sheetLesson.title}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--muted)] m-0">
                  {courseOfLesson(sheetLesson.courseId)?.title || 'عام'} ·{' '}
                  {formatLongDate(sheetLesson.date)}
                </p>
                <h3 className="text-lg font-bold font-display text-[var(--fg)] m-0 mt-1">
                  {sheetLesson.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheetLessonId(null)}
                className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--line)]/50 transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player or External Link */}
            {sheetLesson.url && (
              <div className="rounded-xl overflow-hidden border border-[var(--line)] bg-black/5">
                {getYouTubeEmbedUrl(sheetLesson.url) ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={getYouTubeEmbedUrl(sheetLesson.url)!}
                      title={sheetLesson.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <a
                      href={sheetLesson.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>فتح الفيديو الخارجي في نافذة جديدة</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Exercises & Practical Applications Section */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-4 grid gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm font-display text-[var(--fg)] m-0 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[var(--accent)]" />
                  <span>تمارين وتطبيقات عملية للمحاضرة</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    {sheetLesson.exercises?.length || 0}
                  </span>
                </h4>
              </div>

              {sheetLesson.exercises && sheetLesson.exercises.length > 0 ? (
                <div className="grid gap-2.5">
                  {sheetLesson.exercises.map((ex, idx) => (
                    <ExerciseItemRow
                      key={ex.id || `ex_${idx}`}
                      exercise={ex}
                      index={idx + 1}
                      lessonId={sheetLesson.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-3 px-3 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-xl bg-[var(--bg)]/50">
                  لا توجد تمارين إضافية محددة لهذه المحاضرة. ركّز على التطبيق العملي للشرح المرفق.
                </div>
              )}
            </div>

            {/* Attendance Status Notification */}
            {isAttended(sheetLesson.id) ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                تم تسجيل حضورك لهذا الدرس بنجاح{' '}
                {attendance[sheetLesson.id]?.attended
                  ? formatDateTime(attendance[sheetLesson.id]!.attended!)
                  : ''}
                .
              </div>
            ) : sheetLesson.date > todayKey ? (
              <div className="p-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--accent-soft)]/20 text-[var(--muted)] text-xs">
                يفتح تسجيل الحضور في يوم الدرس، {formatLongDate(sheetLesson.date)}.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                شاهد شرح الدرس كاملاً، ثم اضغط على زر «سجّل حضوري» لتسجيل إنجازك في السجل الرسمي.
              </div>
            )}

            {/* Attendance Buttons */}
            <div className="grid gap-2 pt-2">
              {isAttended(sheetLesson.id) ? (
                <button
                  type="button"
                  onClick={() => onSaveAttendance(sheetLesson.id, false)}
                  className="w-full py-2.5 rounded-xl border border-[var(--bad)] text-[var(--bad)] text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  إلغاء تسجيل الحضور
                </button>
              ) : (
                <button
                  type="button"
                  disabled={sheetLesson.date > todayKey}
                  onClick={() => onSaveAttendance(sheetLesson.id, true)}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  سجّل حضوري الآن
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveSheetLessonId(null)}
                className="w-full py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
