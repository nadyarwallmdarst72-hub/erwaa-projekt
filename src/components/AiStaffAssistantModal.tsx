import React, { useState } from 'react';
import { Course, Lesson, LessonExercise, Role } from '../types';
import {
  Sparkles,
  Bot,
  Send,
  BookOpen,
  CalendarDays,
  Megaphone,
  HelpCircle,
  Copy,
  Check,
  Plus,
  X,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface AiStaffAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  courses: Course[];
  lessons: Lesson[];
  onAddExercisesToLesson?: (lessonId: string, exercises: LessonExercise[]) => void;
  onAddAnnouncement?: (title: string, text: string) => void;
}

type AiMode = 'exercises' | 'quiz' | 'announcement' | 'consult';

export const AiStaffAssistantModal: React.FC<AiStaffAssistantModalProps> = ({
  isOpen,
  onClose,
  role,
  courses,
  lessons,
  onAddExercisesToLesson,
  onAddAnnouncement,
}) => {
  const [mode, setMode] = useState<AiMode>('exercises');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || '');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedMsg, setAppliedMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Staff guard: strictly for owner or teacher
  const isStaff = role === 'owner' || role === 'teacher';
  if (!isStaff) return null;

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const currentLesson = lessons.find((l) => l.id === selectedLessonId);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setAppliedMsg('');
    setAiResponse('');

    try {
      let promptToSend = userPrompt;
      let contextPayload: any = {};

      if (mode === 'exercises') {
        contextPayload = {
          courseTitle: currentCourse?.title || '',
          lessonTitle: currentLesson?.title || '',
          lessonDate: currentLesson?.date || '',
        };
        if (!promptToSend) {
          promptToSend = `يرجى اقتراح 2-3 تمارين وتطبيقات عملية لمحاضرة: "${currentLesson?.title || 'المحاضرة الحالية'}" في مقرر "${currentCourse?.title || 'المقرر'}" مع وصف واضح لكل تمرين وتلميح للحل.`;
        }
      } else if (mode === 'quiz') {
        contextPayload = {
          courseTitle: currentCourse?.title || '',
        };
        if (!promptToSend) {
          promptToSend = `يرجى اقتراح 3 أسئلة اختيار من متعدد لمقرر: "${currentCourse?.title || 'المقرر'}" مع 4 خيارات وتوضيح الإجابة الصحيحة.`;
        }
      } else if (mode === 'announcement') {
        if (!promptToSend) {
          promptToSend = 'صياغة إعلان تذكيري للطلاب حول موعد المحاضرة القادمة وتسليم المشاريع وأهمية الحضور.';
        }
      }

      const res = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          mode: mode === 'exercises' ? 'generate_exercises' : mode === 'quiz' ? 'generate_quiz' : mode === 'announcement' ? 'draft_announcement' : 'general_assistant',
          prompt: promptToSend,
          context: contextPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'فشل الاتصال بخدمة الذكاء الاصطناعي');
      }

      setAiResponse(data.reply || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyDirectly = () => {
    if (!aiResponse) return;

    if (mode === 'exercises' && onAddExercisesToLesson && selectedLessonId) {
      // Create a structured exercise from the AI response
      const newEx: LessonExercise = {
        id: `ex_ai_${Date.now()}`,
        title: `تمرين تطبيقي مقترح: ${currentLesson?.title || 'المحاضرة'}`,
        description: aiResponse.slice(0, 450),
        solutionHint: 'اعتمد على مفاهيم المحاضرة وأمثلة الكود المشروحة لحل التطبيق.',
      };
      onAddExercisesToLesson(selectedLessonId, [newEx]);
      setAppliedMsg('تمت إضافة التمارين بنجاح إلى المحاضرة وحفظها سحابياً!');
    } else if (mode === 'announcement' && onAddAnnouncement) {
      const lines = aiResponse.split('\n').filter((l) => l.trim());
      const title = lines[0]?.replace(/^[#*\-•\s]+/, '').slice(0, 60) || 'إعلان أكاديمي هام';
      const text = lines.slice(1).join('\n').trim() || aiResponse;
      onAddAnnouncement(title, text);
      setAppliedMsg('تم نشر الإعلان بنجاح وتعميمه سحابياً على جميع الطلاب!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-2xl animate-slide-up grid gap-4 max-h-[90dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-display text-[var(--fg)] m-0">
                  المساعد الأكاديمي الذكي
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  {role === 'owner' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  خاص بالمالك والمشرف فقط
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                مساعدتك في توليد تمارين المحاضرات، صياغة الاختبارات، كتابة الإعلانات وتطوير المناهج
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'exercises' as AiMode, label: 'توليد تمارين لمحاضرة', icon: <CalendarDays className="w-4 h-4" /> },
            { key: 'quiz' as AiMode, label: 'اقتراح أسئلة اختبار', icon: <HelpCircle className="w-4 h-4" /> },
            { key: 'announcement' as AiMode, label: 'صياغة إعلان أكاديمي', icon: <Megaphone className="w-4 h-4" /> },
            { key: 'consult' as AiMode, label: 'استشارة بيداغوجية', icon: <Bot className="w-4 h-4" /> },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMode(item.key);
                setAiResponse('');
                setAppliedMsg('');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                mode === item.key
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                  : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Context Selectors */}
        {mode === 'exercises' && (
          <div className="grid sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[var(--bg)]/50 border border-[var(--line)]">
            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              المقرر التعليمي:
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              المحاضرة المراد وضع التمارين لها:
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
              >
                {lessons
                  .filter((l) => !selectedCourseId || l.courseId === selectedCourseId)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.date})
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}

        {mode === 'quiz' && (
          <div className="p-3 rounded-2xl bg-[var(--bg)]/50 border border-[var(--line)]">
            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              المقرر المستهدف للاختبار:
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Prompt input */}
        <div className="grid gap-1.5">
          <label className="text-xs font-bold text-[var(--muted)]">
            {mode === 'exercises'
              ? 'ملاحظات أو توجيهات إضافية للتمارين (اختياري):'
              : mode === 'announcement'
              ? 'أدخل النقاط الأساسية أو موضوع الإعلان:'
              : 'اكتب استفسارك أو طلبك للذكاء الاصطناعي:'}
          </label>
          <div className="relative">
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={
                mode === 'exercises'
                  ? 'مثال: ركز على تطبيق المفاهيم البرمجية عملياً دون تعقيد نظري...'
                  : mode === 'announcement'
                  ? 'مثال: تذكير الطلاب باقتراب موعد الاختبار النصفي والتأكيد على نسبة الحضور 80%...'
                  : 'اطرح سؤالك الأكاديمي أو طلبك هنا...'
              }
              rows={2}
              className="w-full p-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-2 self-start transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            <span>{isLoading ? 'جاري التحليل والتوليد الذكي...' : 'توليد المقترح بالذكاء الاصطناعي'}</span>
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Success / Applied notification */}
        {appliedMsg && (
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{appliedMsg}</span>
          </div>
        )}

        {/* AI Output Card */}
        {aiResponse && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xs grid gap-3 animate-slide-up">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
              <span className="font-bold text-xs text-[var(--fg)] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[var(--accent)]" />
                المقترح الذكي المولّد
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>

                {(mode === 'exercises' || mode === 'announcement') && (
                  <button
                    type="button"
                    onClick={handleApplyDirectly}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {mode === 'exercises'
                        ? 'إدراج التمارين بالدرس وحفظها'
                        : 'نشر الإعلان مباشرة للطلاب'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs text-[var(--fg)] leading-relaxed whitespace-pre-line font-body p-3 rounded-xl bg-[var(--bg)]/50 border border-[var(--line)] max-h-[220px] overflow-y-auto">
              {aiResponse}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
