import React, { useState, useEffect } from 'react';
import { Quiz, Course, QuizResult, QuizAttempt } from '../types';
import { formatDateTime, padZero } from '../storage';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface QuizzesViewProps {
  quizzes: Quiz[];
  courses: Course[];
  enrolled: Record<string, { at: number }>;
  results: Record<string, QuizResult>;
  attempts: Record<string, QuizAttempt>;
  onStartAttempt: (quizId: string) => void;
  onSubmitResult: (quizId: string, score: number, total: number) => void;
  onNavigateTab: (tab: any) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  quizzes,
  courses,
  enrolled,
  results,
  attempts,
  onStartAttempt,
  onSubmitResult,
  onNavigateTab,
}) => {
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);
  const courseOf = (cid?: string) => courses.find((c) => c.id === cid);

  const isVisibleForStudent = (item: { courseId?: string }) => {
    if (!item.courseId) return true;
    return !!enrolled[item.courseId];
  };

  const studentQuizzes = quizzes.filter(isVisibleForStudent);

  const getQuizState = (q: Quiz) => {
    const now = Date.now();
    const res = results[q.id];
    if (q.opensAt && now < q.opensAt) {
      return { status: 'soon', label: `يبدأ ${formatDateTime(q.opensAt)}`, canTake: false };
    }
    if (q.closesAt && now > q.closesAt) {
      return { status: 'closed', label: `انتهى ${formatDateTime(q.closesAt)}`, canTake: false };
    }
    if (q.single && res) {
      return { status: 'done', label: 'أنهيت المحاولة الوحيدة', canTake: false };
    }
    const att = attempts[q.id];
    if (
      att &&
      (!res || res.at < att.startedAt) &&
      (!q.minutes || now < att.startedAt + q.minutes * 60000)
    ) {
      return { status: 'resume', label: 'محاولة جارية', canTake: true };
    }
    if (q.single && att) {
      return { status: 'done', label: 'انتهت المحاولة', canTake: false };
    }
    return {
      status: 'open',
      label: q.closesAt ? `ينتهي ${formatDateTime(q.closesAt)}` : 'متاح الآن للتقديم',
      canTake: true,
    };
  };

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuizId(q.id);
    setAnswers({});
    setIsCompleted(false);

    onStartAttempt(q.id);

    if (q.minutes && q.minutes > 0) {
      setTimeRemainingSeconds(q.minutes * 60);
    } else {
      setTimeRemainingSeconds(null);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!activeQuiz || isCompleted || timeRemainingSeconds === null) return;

    if (timeRemainingSeconds <= 0) {
      // Auto submit when time expires
      handleSubmitAnswers();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, isCompleted, timeRemainingSeconds]);

  const handleSubmitAnswers = () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        score++;
      }
    });

    setIsCompleted(true);
    onSubmitResult(activeQuiz.id, score, activeQuiz.questions.length);
  };

  // If in quiz runner
  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    let currentScore = 0;
    if (isCompleted) {
      questions.forEach((q, i) => {
        if (answers[i] === q.answer) currentScore++;
      });
    }

    const allAnswered = questions.every((_, i) => answers[i] !== undefined);
    const isLowTime =
      timeRemainingSeconds !== null && timeRemainingSeconds <= 60 && !isCompleted;

    return (
      <div className="max-w-2xl mx-auto w-full grid gap-4">
        {/* Sticky Timer Bar */}
        {timeRemainingSeconds !== null && !isCompleted && (
          <div
            className={`sticky top-3 z-30 flex items-center justify-between px-4 py-2.5 rounded-2xl shadow-lg border transition-colors ${
              isLowTime
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-[var(--accent)] text-white border-[var(--accent)]'
            }`}
          >
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              الوقت المتبقي لإنهاء الاختبار
            </span>
            <span className="font-mono font-bold text-sm">
              {padZero(Math.floor(timeRemainingSeconds / 60))}:
              {padZero(timeRemainingSeconds % 60)}
            </span>
          </div>
        )}

        {/* Quiz Header Card */}
        <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              {courseOf(activeQuiz.courseId)?.title || 'عام'}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {questions.length} أسئلة
            </span>
          </div>
          <h2 className="text-lg font-bold font-display text-[var(--fg)] m-0">
            {activeQuiz.title}
          </h2>

          {isCompleted && (
            <div className="mt-4 p-4 rounded-xl text-center border border-[var(--line)] bg-[var(--accent-soft)]/30">
              <p className="text-xs text-[var(--muted)] m-0 mb-1">نتيجتك النهائية</p>
              <div
                className="text-4xl font-black font-display"
                style={{ color: 'var(--accent)' }}
              >
                {currentScore} / {questions.length}
              </div>
              <p className="text-xs font-semibold text-[var(--muted)] mt-1 mb-0">
                نسبة النجاح: {Math.round((currentScore * 100) / questions.length)}%
              </p>
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="grid gap-3">
          {questions.map((q, qIndex) => {
            const studentSelected = answers[qIndex];
            return (
              <div
                key={qIndex}
                className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
              >
                <div className="flex items-start gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: 'var(--accent-soft)',
                      color: 'var(--accent)',
                    }}
                  >
                    {qIndex + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-[var(--fg)] m-0 leading-relaxed">
                    {q.q}
                  </h3>
                </div>

                <div className="grid gap-2 ps-8">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = studentSelected === optIndex;
                    const isCorrectAnswer = q.answer === optIndex;

                    let btnStyle =
                      'border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] hover:bg-[var(--accent-soft)]/30';

                    if (isCompleted) {
                      if (isCorrectAnswer) {
                        btnStyle =
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrectAnswer) {
                        btnStyle =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through';
                      } else {
                        btnStyle = 'opacity-60 border-[var(--line)] bg-[var(--surface)]';
                      }
                    } else if (isSelected) {
                      btnStyle =
                        'border-[var(--accent)] bg-[var(--accent-soft)] font-bold text-[var(--fg)]';
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        disabled={isCompleted}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }))
                        }
                        className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isCompleted && isCorrectAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                        {isCompleted && isSelected && !isCorrectAnswer && (
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isCompleted && studentSelected !== q.answer && (
                  <div className="ps-8 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    الإجابة الصحيحة هي: {q.options[q.answer]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-3">
          {isCompleted ? (
            <div className="flex items-center gap-2">
              {!activeQuiz.single && (
                <button
                  type="button"
                  onClick={() => handleStartQuiz(activeQuiz)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة المحاولة
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveQuizId(null)}
                className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)] flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                رجوع لقائمة الاختبارات
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between">
              <button
                type="button"
                onClick={handleSubmitAnswers}
                disabled={!allAnswered && timeRemainingSeconds !== null && timeRemainingSeconds > 0}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                تسليم الإجابات والتصحيح
              </button>
              <button
                type="button"
                onClick={() => setActiveQuizId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
              >
                إلغاء والعودة
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quizzes Catalog List
  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
          <h2 className="font-bold text-base m-0 font-display flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
            اختباراتي المعتمدة
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[var(--accent-soft)] text-[var(--accent)]">
            {studentQuizzes.length} {studentQuizzes.length === 1 ? 'اختبار' : 'اختبارات'}
          </span>
        </div>

        {studentQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4">
            {studentQuizzes.map((quiz) => {
              const course = courseOf(quiz.courseId);
              const state = getQuizState(quiz);
              const result = results[quiz.id];

              return (
                <div
                  key={quiz.id}
                  className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] flex flex-col justify-between gap-3 shadow-xs transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm sm:text-base m-0 text-[var(--fg)]">
                        {quiz.title}
                      </h3>
                      {course && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          {course.title}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                      <span>{(quiz.questions || []).length} أسئلة اختيار من متعدد</span>
                      {quiz.minutes ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {quiz.minutes} دقيقة
                        </span>
                      ) : (
                        <span>بدون وقت محدد</span>
                      )}
                      <span>{state.label}</span>
                    </div>

                    {result && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          أفضل نتيجة حققتها: {result.best} من {result.total} (
                          {Math.round((result.best * 100) / result.total)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={!state.canTake}
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {state.status === 'resume'
                        ? 'تابع الاختبار'
                        : result
                        ? 'إعادة الاختبار'
                        : 'ابدأ الاختبار'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            لا توجد اختبارات مخصصة لدوراتك في الوقت الراهن.
          </div>
        )}
      </div>
    </div>
  );
};
