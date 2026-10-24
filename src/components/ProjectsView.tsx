import React, { useState } from 'react';
import { Project, ProjectReview, Course } from '../types';
import { formatShortDate } from '../storage';
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  MessageSquare,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  reviews: Record<string, ProjectReview>;
  courses: Course[];
  enrolled: Record<string, { at: number }>;
  onSaveProject: (data: Partial<Project>, projectId?: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  reviews,
  courses,
  enrolled,
  onSaveProject,
  onDeleteProject,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [formError, setFormError] = useState('');

  const enrolledCourses = courses.filter((c) => !!enrolled[c.id]);

  const openNewForm = () => {
    setEditingId(null);
    setTitle('');
    setCourseId(enrolledCourses[0]?.id || '');
    setText('');
    setLink('');
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setCourseId(p.courseId || enrolledCourses[0]?.id || '');
    setText(p.text || '');
    setLink(p.link || '');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('الرجاء كتابة عنوان المشروع.');
      return;
    }
    if (!text.trim() && !link.trim()) {
      setFormError('الرجاء كتابة نبذة عن المشروع أو إرفاق الرابط الخارجي.');
      return;
    }
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      setFormError('الرابط يجب أن يبدأ بـ https://');
      return;
    }

    onSaveProject(
      {
        title: title.trim(),
        courseId,
        text: text.trim(),
        link: link.trim(),
      },
      editingId || undefined
    );

    setIsFormOpen(false);
  };

  const getStatusBadge = (p: Project, review?: ProjectReview) => {
    if (!review) {
      return {
        label: 'بانتظار المراجعة',
        cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
        icon: <Clock className="w-3 h-3" />,
      };
    }
    if ((p.updatedAt || 0) > review.at) {
      return {
        label: 'تم التحديث - بانتظار المراجعة',
        cls: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
        icon: <Clock className="w-3 h-3" />,
      };
    }
    if (review.status === 'returned') {
      return {
        label: 'مطلوب تعديل',
        cls: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
        icon: <AlertTriangle className="w-3 h-3" />,
      };
    }
    return {
      label: 'تمت المراجعة والاعتماد',
      cls: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
      icon: <CheckCircle2 className="w-3 h-3" />,
    };
  };

  return (
    <div className="grid gap-4">
      {/* Header bar & New Project button */}
      {!isFormOpen && (
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-display text-[var(--fg)] m-0 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[var(--accent)]" />
              مشاريعي التطبيقية
            </h2>
            <p className="text-xs text-[var(--muted)] m-0">
              سلّم أعمالك ليقوم المعلم المشرف بمراجعتها وتقييمها
            </p>
          </div>
          <button
            type="button"
            onClick={openNewForm}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus className="w-4 h-4" />
            مشروع جديد
          </button>
        </div>
      )}

      {/* Submission Form */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-md grid gap-3 animate-slide-up"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              {editingId ? 'تعديل بيانات المشروع' : 'تسليم مشروع تطبيقي جديد'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--fg)]"
            >
              إلغاء
            </button>
          </div>

          <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
            عنوان المشروع
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تطبيق قائمة المهام التفاعلي باستخدام React"
              className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
            الدورة التابع لها المشروع
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))
              ) : (
                <option value="">بدون دورة محددة</option>
              )}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
            شرح ووصف المشروع
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="اكتب نبذة عن التقنيات المستخدمة، فكرة المشروع، وكيفية تشغيله..."
              className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
            رابط المشروع الخارجي (Google Drive، GitHub، Figma، رابط موقع)
            <input
              type="url"
              dir="ltr"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://"
              className="px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </label>

          {formError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold m-0">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {editingId ? 'حفظ التعديلات' : 'تسليم المشروع للمراجعة'}
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="grid gap-3">
          {projects.map((p) => {
            const review = reviews[p.id];
            const badge = getStatusBadge(p, review);
            const course = courses.find((c) => c.id === p.courseId);

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
              >
                <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-2.5">
                  <div>
                    <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                      {course?.title || 'بدون دورة'} · تاريخ التسليم:{' '}
                      {formatShortDate(p.createdAt || Date.now())}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}
                  >
                    {badge.icon}
                    {badge.label}
                  </span>
                </div>

                {p.text && (
                  <p className="text-xs sm:text-sm text-[var(--fg)] leading-relaxed m-0 whitespace-pre-line opacity-90">
                    {p.text}
                  </p>
                )}

                {p.link && (
                  <div>
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح رابط المشروع الخارجي</span>
                    </a>
                  </div>
                )}

                {/* Supervisor Review Feedback */}
                {review && (review.feedback || review.grade) && (
                  <div className="p-3.5 rounded-xl bg-[var(--accent-soft)]/40 border border-[var(--line)] grid gap-2">
                    {review.grade && (
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--accent)' }}>
                        <Award className="w-4 h-4" />
                        <span>العلامة المرصودة: {review.grade}</span>
                      </div>
                    )}
                    {review.feedback && (
                      <div>
                        <span className="text-[11px] font-bold text-[var(--muted)] flex items-center gap-1 mb-0.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          ملاحظات المشرف الأكاديمي:
                        </span>
                        <p className="text-xs leading-relaxed text-[var(--fg)] m-0 whitespace-pre-line font-medium">
                          {review.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit / Delete Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditForm(p)}
                    className="p-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع؟')) {
                        onDeleteProject(p.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-xs font-semibold text-[var(--bad)] hover:opacity-80 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-center text-sm text-[var(--muted)]">
          <p className="m-0 mb-3">لم تسلّم أي مشاريع حتى الآن.</p>
          <button
            type="button"
            onClick={openNewForm}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            تسليم أول مشروع
          </button>
        </div>
      )}
    </div>
  );
};
