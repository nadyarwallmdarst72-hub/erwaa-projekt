import React from 'react';
import { Course, Lesson, Student } from '../types';
import { BookOpen, UserCheck, CheckCircle2, Award, Clock } from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  lessons: Lesson[];
  enrolled: Record<string, { at: number }>;
  student?: Student;
  onEnroll: (courseId: string, enroll: boolean) => void;
  onNavigateTab: (tab: any) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  lessons,
  enrolled,
  student,
  onEnroll,
  onNavigateTab,
}) => {
  const enrolledCount = Object.keys(enrolled).length;

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

      {/* Courses List */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
          <h2 className="font-bold text-base m-0 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--accent)]" />
            قائمة الدورات المتاحة
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[var(--accent-soft)] text-[var(--accent)]">
            مسجّل في {enrolledCount} {enrolledCount === 1 ? 'دورة' : 'دورات'}
          </span>
        </div>

        {courses.length > 0 ? (
          <div className="divide-y divide-[var(--line)]">
            {courses.map((course) => {
              const isEnrolled = !!enrolled[course.id];
              const courseLessons = lessons.filter((l) => l.courseId === course.id);

              return (
                <div
                  key={course.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--accent-soft)]/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
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

                  <div className="flex-shrink-0 self-end sm:self-center">
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
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            لا توجد دورات مسجلة في المنصة حالياً.
          </div>
        )}
      </div>
    </div>
  );
};
