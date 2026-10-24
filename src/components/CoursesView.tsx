import React, { useState } from 'react';
import { Course, Lesson, Student, CourseMaterial, Role } from '../types';
import {
  BookOpen,
  UserCheck,
  CheckCircle2,
  Award,
  Clock,
  FileText,
  FileCode,
  ExternalLink,
  Download,
  FolderOpen,
  Plus,
  Trash2,
  GraduationCap,
} from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  lessons: Lesson[];
  enrolled: Record<string, { at: number }>;
  student?: Student;
  role?: Role;
  onEnroll: (courseId: string, enroll: boolean) => void;
  onAddMaterial?: (courseId: string, mat: Omit<CourseMaterial, 'id'>) => void;
  onDeleteMaterial?: (courseId: string, materialId: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  lessons,
  enrolled,
  student,
  role,
  onEnroll,
  onAddMaterial,
  onDeleteMaterial,
  onNavigateTab,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'course' | 'subject'>('all');
  const [expandedMaterialsCourseId, setExpandedMaterialsCourseId] = useState<string | null>(null);

  // Add material inline state
  const [addingMaterialCourseId, setAddingMaterialCourseId] = useState<string | null>(null);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<CourseMaterial['type']>('pdf');
  const [matUrl, setMatUrl] = useState('');
  const [matSize, setMatSize] = useState('');
  const [matDesc, setMatDesc] = useState('');

  const isStaff = role === 'owner' || role === 'teacher';
  const enrolledCount = Object.keys(enrolled).length;

  const filteredCourses = courses.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType || (!c.type && filterType === 'course');
  });

  const handleCreateMaterial = (courseId: string) => {
    if (!matTitle.trim() || !matUrl.trim() || !onAddMaterial) return;
    onAddMaterial(courseId, {
      title: matTitle.trim(),
      type: matType,
      url: matUrl.trim(),
      size: matSize.trim() || undefined,
      description: matDesc.trim() || undefined,
    });
    setAddingMaterialCourseId(null);
    setMatTitle('');
    setMatUrl('');
    setMatSize('');
    setMatDesc('');
  };

  const getMaterialIcon = (type: CourseMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'link':
        return <ExternalLink className="w-4 h-4 text-teal-500" />;
      default:
        return <FileCode className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="grid gap-4">
      {/* Student Name Hint if empty */}
      {!student?.name && (
        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="text-xs sm:text-sm">
            <p className="font-bold m-0 mb-0.5">اسمك غير مسجل بعد</p>
            <p className="m-0 text-amber-700 dark:text-amber-300">
              أضف اسمك الكامل ليظهر في شهادات الإتمام وكشوفات الحضور لدى المعلمين.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('certs')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            إضافة الاسم
          </button>
        </div>
      )}

      {/* Courses & Subjects Navigation & Filter Tabs */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            جميع البرامج ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('course')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'course'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            دورات تدريبية ({courses.filter((c) => c.type !== 'subject').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('subject')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'subject'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            مواد دراسية ({courses.filter((c) => c.type === 'subject').length})
          </button>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[var(--accent-soft)] text-[var(--accent)] hidden sm:block">
          مسجّل في {enrolledCount}
        </span>
      </div>

      {/* Courses List */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
          <h2 className="font-bold text-base m-0 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--accent)]" />
            {filterType === 'subject'
              ? 'المواد الدراسية والمذكرات الأكاديمية'
              : filterType === 'course'
              ? 'الدورات التدريبية المعتمدة'
              : 'كافة الدورات والمواد التعليمية'}
          </h2>
          <span className="text-xs text-[var(--muted)]">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'مقرر' : 'مقررات'}
          </span>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="divide-y divide-[var(--line)]">
            {filteredCourses.map((course) => {
              const isEnrolled = !!enrolled[course.id];
              const courseLessons = lessons.filter((l) => l.courseId === course.id);
              const materials = course.materials || [];
              const isMaterialsOpen = expandedMaterialsCourseId === course.id;

              return (
                <div
                  key={course.id}
                  className="p-4 flex flex-col gap-3 hover:bg-[var(--accent-soft)]/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {course.type === 'subject' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            مادة دراسية
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            دورة تدريبية
                          </span>
                        )}

                        <h3 className="font-bold text-sm sm:text-base m-0 text-[var(--fg)]">
                          {course.title}
                        </h3>

                        {isEnrolled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            أنت مسجّل
                          </span>
                        )}
                      </div>

                      {course.desc && (
                        <p className="text-xs text-[var(--muted)] m-0 mb-2 leading-relaxed">
                          {course.desc}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                        {course.teacher && (
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                            المشرف: {course.teacher}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {courseLessons.length} دروس
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          الشهادة: حضور {course.minAtt || 80}%
                          {course.minScore ? ` ومعدل ${course.minScore}%` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      {/* Toggle Materials Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMaterialsCourseId(
                            isMaterialsOpen ? null : course.id
                          )
                        }
                        className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-1.5"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>المواد والملفات ({materials.length})</span>
                      </button>

                      {isEnrolled ? (
                        <button
                          type="button"
                          onClick={() => onEnroll(course.id, false)}
                          className="px-3.5 py-1.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--bad)] hover:border-[var(--bad)] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        >
                          إلغاء التسجيل
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEnroll(course.id, true)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 cursor-pointer"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          سجّلني في الدورة
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Materials Drawer */}
                  {isMaterialsOpen && (
                    <div className="mt-2 p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/40 grid gap-2.5 animate-slide-up">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
                          <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
                          المذكرات والمراجع المرفقة
                        </span>
                        {isStaff && (
                          <button
                            type="button"
                            onClick={() =>
                              setAddingMaterialCourseId(
                                addingMaterialCourseId === course.id ? null : course.id
                              )
                            }
                            className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            إرفاق ملف جديد
                          </button>
                        )}
                      </div>

                      {/* Add material form for staff */}
                      {addingMaterialCourseId === course.id && (
                        <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] grid gap-2">
                          <span className="text-[11px] font-bold text-[var(--muted)]">
                            إضافة مادة تعليمية جديدة:
                          </span>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={matTitle}
                              onChange={(e) => setMatTitle(e.target.value)}
                              placeholder="عنوان المادة / المذكرة"
                              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                            />
                            <select
                              value={matType}
                              onChange={(e) => setMatType(e.target.value as any)}
                              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                            >
                              <option value="pdf">ملف PDF</option>
                              <option value="doc">مستند نصي</option>
                              <option value="link">رابط خارجي</option>
                              <option value="video">مقطع فيديو</option>
                            </select>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input
                              type="url"
                              dir="ltr"
                              value={matUrl}
                              onChange={(e) => setMatUrl(e.target.value)}
                              placeholder="https://..."
                              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                            />
                            <input
                              type="text"
                              value={matSize}
                              onChange={(e) => setMatSize(e.target.value)}
                              placeholder="الحجم (مثال: 3.5 MB)"
                              className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                            />
                          </div>
                          <input
                            type="text"
                            value={matDesc}
                            onChange={(e) => setMatDesc(e.target.value)}
                            placeholder="وصف مختصر للملف..."
                            className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleCreateMaterial(course.id)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                              style={{ backgroundColor: 'var(--accent)' }}
                            >
                              حفظ الملف
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingMaterialCourseId(null)}
                              className="px-3 py-1 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Materials List */}
                      {materials.length > 0 ? (
                        <div className="grid gap-1.5">
                          {materials.map((m) => (
                            <div
                              key={m.id}
                              className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between gap-3 hover:border-[var(--accent)] transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {getMaterialIcon(m.type)}
                                <div className="min-w-0">
                                  <span className="font-bold text-xs text-[var(--fg)] block truncate">
                                    {m.title}
                                  </span>
                                  {m.description && (
                                    <span className="text-[11px] text-[var(--muted)] block truncate">
                                      {m.description}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {m.size && (
                                  <span className="text-[10px] text-[var(--muted)] font-mono">
                                    {m.size}
                                  </span>
                                )}
                                <a
                                  href={m.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)] flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>فتح / تنزيل</span>
                                </a>

                                {isStaff && onDeleteMaterial && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteMaterial(course.id, m.id)}
                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    title="حذف الملف"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--muted)] m-0 text-center py-2">
                          لا توجد ملفات مرفقة لهذا المقرر حتى الآن.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            لا توجد مقررات متطابقة مع التصفية الحالية.
          </div>
        )}
      </div>
    </div>
  );
};
