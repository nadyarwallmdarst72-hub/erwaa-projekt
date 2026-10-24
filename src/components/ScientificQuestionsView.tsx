import React, { useState } from 'react';
import {
  ScientificQuestion,
  ScientificAnswer,
  Course,
  UserAccount,
  Role,
} from '../types';
import { formatDateTime, formatShortDate } from '../storage';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  CheckCircle2,
  Check,
  Search,
  Filter,
  Trash2,
  User,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ScientificQuestionsViewProps {
  questions: ScientificQuestion[];
  courses: Course[];
  currentUser: UserAccount | null;
  onAddQuestion: (data: {
    title: string;
    content: string;
    courseId?: string;
    courseTitle?: string;
    tags?: string[];
  }) => void;
  onAddAnswer: (questionId: string, content: string) => void;
  onToggleVerifyAnswer: (questionId: string, answerId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onOpenAuthModal: () => void;
}

export const ScientificQuestionsView: React.FC<ScientificQuestionsViewProps> = ({
  questions,
  courses,
  currentUser,
  onAddQuestion,
  onAddAnswer,
  onToggleVerifyAnswer,
  onDeleteQuestion,
  onOpenAuthModal,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );

  // New Question Form state
  const [isAsking, setIsAsking] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newTags, setNewTags] = useState('');
  const [formError, setFormError] = useState('');

  // Answer state for currently expanded question
  const [answerContent, setAnswerContent] = useState('');

  const isStaff = currentUser?.role === 'owner' || currentUser?.role === 'teacher';

  const filteredQuestions = questions.filter((q) => {
    const matchesCourse =
      selectedCourseFilter === 'all' || q.courseId === selectedCourseFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (!newTitle.trim()) {
      setFormError('يرجى كتابة عنوان مختصر للسؤال.');
      return;
    }
    if (!newContent.trim()) {
      setFormError('يرجى كتابة تفاصيل السؤال العلمي.');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === newCourseId);
    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddQuestion({
      title: newTitle.trim(),
      content: newContent.trim(),
      courseId: newCourseId,
      courseTitle: selectedCourse?.title,
      tags: tagsArray,
    });

    setIsAsking(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setFormError('');
  };

  const handleAnswerSubmit = (qId: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (!answerContent.trim()) return;

    onAddAnswer(qId, answerContent.trim());
    setAnswerContent('');
  };

  return (
    <div className="grid gap-4">
      {/* Top Header & Ask Button */}
      <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold font-display text-[var(--fg)] m-0 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
            منتدى الأسئلة العلمية والمناقشات
          </h2>
          <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
            اطرح استفساراتك حول المقررات والدروس وتلقَّ إجابات موثقة ومعتمدة من الأساتذة
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              onOpenAuthModal();
            } else {
              setIsAsking(!isAsking);
            }
          }}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center gap-1.5 self-start sm:self-center transition-all hover:opacity-95"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Plus className="w-4 h-4" />
          <span>{isAsking ? 'إغلاق النموذج' : 'طرح سؤال علمي جديد'}</span>
        </button>
      </div>

      {/* Ask Question Form */}
      {isAsking && (
        <form
          onSubmit={handleAskSubmit}
          className="p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-md grid gap-3 animate-slide-up"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
            <h3 className="font-bold text-sm font-display text-[var(--fg)] m-0 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              صياغة سؤال علمي جديد
            </h3>
            <button
              type="button"
              onClick={() => setIsAsking(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--fg)]"
            >
              إلغاء
            </button>
          </div>

          <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
            عنوان السؤال (بشكل واضح ودقيق)
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="مثال: كيف يعمل خوارزمية البحث الثنائي وما شرط تطبيقها؟"
              className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              المقرر أو الدورة المرتبطة
              <select
                value={newCourseId}
                onChange={(e) => setNewCourseId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              الكلمات المفتاحية (مفصولة بفاصلة)
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="خوارزميات, كود, هياكل بيانات"
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </label>
          </div>

          <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
            تفاصيل السؤال العلمي والشرح التوضيحي
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              placeholder="اشرح المشكلة العلمية بالتفصيل أو ضع جزء الكود الذي تحتاج مساعدة فيه..."
              className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs sm:text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </label>

          {formError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold m-0">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              نشر السؤال العلمي
            </button>
            <button
              type="button"
              onClick={() => setIsAsking(false)}
              className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأسئلة العلمية والمواضيع..."
            className="w-full ps-9 pe-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
          />
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] w-full sm:w-auto"
          >
            <option value="all">كافة المقررات والمواضيع</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="grid gap-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;
            const hasVerifiedAnswer = q.answers.some((a) => a.isVerified);
            const canDelete =
              currentUser?.role === 'owner' || currentUser?.id === q.uid;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden transition-all"
              >
                {/* Question Header Card */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                  className="p-4 cursor-pointer hover:bg-[var(--accent-soft)]/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {q.courseTitle && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                          {q.courseTitle}
                        </span>
                      )}
                      {hasVerifiedAnswer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          إجابة معتمدة
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--muted)] flex-shrink-0">
                      {formatShortDate(q.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[var(--fg)] m-0 leading-relaxed font-display">
                    {q.title}
                  </h3>

                  <p className="text-xs text-[var(--muted)] m-0 mt-1 line-clamp-2 leading-relaxed">
                    {q.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mt-2 pt-2 border-t border-[var(--line)]/50">
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {q.authorName}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[var(--accent)]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {q.answers.length} {q.answers.length === 1 ? 'إجابة' : 'إجابات'}
                    </span>
                  </div>
                </div>

                {/* Expanded Thread: Details & Answers */}
                {isExpanded && (
                  <div className="p-4 border-t border-[var(--line)] bg-[var(--bg)]/30 grid gap-4 animate-slide-up">
                    {/* Full question description */}
                    <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                      <p className="text-xs sm:text-sm text-[var(--fg)] m-0 leading-relaxed whitespace-pre-line font-medium">
                        {q.content}
                      </p>
                      {q.tags && q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[var(--line)]/50">
                          {q.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--line)]/50 text-[var(--muted)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {canDelete && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السؤال؟')) {
                                onDeleteQuestion(q.id);
                              }
                            }}
                            className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف السؤال
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Answers List */}
                    <div className="grid gap-2.5">
                      <h4 className="font-bold text-xs text-[var(--muted)] m-0">
                        الإجابات والمناقشات ({q.answers.length})
                      </h4>

                      {q.answers.length > 0 ? (
                        q.answers.map((ans) => {
                          const isAnsStaff =
                            ans.authorRole === 'owner' || ans.authorRole === 'teacher';

                          return (
                            <div
                              key={ans.id}
                              className={`p-3.5 rounded-xl border text-xs sm:text-sm grid gap-2 transition-all ${
                                ans.isVerified
                                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                                  : 'border-[var(--line)] bg-[var(--surface)]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-[var(--fg)]">
                                    {ans.authorName}
                                  </span>
                                  {isAnsStaff && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center gap-0.5">
                                      <ShieldCheck className="w-3 h-3" />
                                      {ans.authorRole === 'owner' ? 'المالك' : 'معلم'}
                                    </span>
                                  )}
                                  {ans.isVerified && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      إجابة معتمدة رسمياً
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[var(--muted)]">
                                  {formatShortDate(ans.createdAt)}
                                </span>
                              </div>

                              <p className="text-xs text-[var(--fg)] leading-relaxed m-0 whitespace-pre-line">
                                {ans.content}
                              </p>

                              {/* Teacher/Owner can toggle verification badge */}
                              {isStaff && (
                                <div className="pt-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => onToggleVerifyAnswer(q.id, ans.id)}
                                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                                      ans.isVerified
                                        ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                        : 'border-[var(--line)] text-[var(--muted)] hover:border-emerald-500 hover:text-emerald-600'
                                    }`}
                                  >
                                    <Check className="w-3 h-3" />
                                    {ans.isVerified ? 'إلغاء الاعتماد' : 'اعتماد كإجابة موثقة'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[var(--muted)] text-center py-4 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                          لا توجد إجابات بعد. كن أول من يجيب ويشارك المعرفة!
                        </p>
                      )}
                    </div>

                    {/* Write Answer Form */}
                    <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] grid gap-2">
                      <span className="text-xs font-bold text-[var(--fg)]">
                        كتابة إجابة أو تعليق:
                      </span>
                      <textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        rows={2}
                        placeholder={
                          currentUser
                            ? 'اكتب شرحك أو إجابتك العلمية المفصلة...'
                            : 'سجّل دخولك أولاً لتتمكن من كتابة إجابة'
                        }
                        disabled={!currentUser}
                        className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAnswerSubmit(q.id)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          إرسال الإجابة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-center text-sm text-[var(--muted)]">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="m-0 mb-3">لا توجد أسئلة تطابق بحثك حالياً.</p>
            <button
              type="button"
              onClick={() => setIsAsking(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              كن أول من يطرح سؤالاً
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
