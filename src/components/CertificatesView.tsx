import React, { useRef, useEffect, useState } from 'react';
import {
  SiteSettings,
  Course,
  Lesson,
  Quiz,
  Certificate,
  Student,
  AttendanceRecord,
  QuizResult,
} from '../types';
import {
  drawCertificate,
  getCertTexts,
  downloadCanvasAsPng,
} from '../utils/certDrawer';
import { Award, Download, CheckCircle2, User, Sparkles } from 'lucide-react';

interface CertificatesViewProps {
  site: SiteSettings;
  certBg: string;
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  certificates: Certificate[];
  enrolled: Record<string, { at: number }>;
  attendance: Record<string, AttendanceRecord>;
  quizResults: Record<string, QuizResult>;
  student: Student;
  onSaveStudentName: (name: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  site,
  certBg,
  courses,
  lessons,
  quizzes,
  certificates,
  enrolled,
  attendance,
  quizResults,
  student,
  onSaveStudentName,
  onNavigateTab,
}) => {
  const [nameInput, setNameInput] = useState(student?.name || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // References to canvases per course
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    if (student?.name) {
      setNameInput(student.name);
    }
  }, [student?.name]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onSaveStudentName(nameInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const enrolledCourseIds = Object.keys(enrolled);
  const enrolledCourses = courses.filter((c) => enrolledCourseIds.includes(c.id));

  // Compute stats for each course
  const getCourseStats = (cid: string) => {
    const course = courses.find((c) => c.id === cid);
    const courseLessons = lessons.filter((l) => l.courseId === cid);
    const attendedCount = courseLessons.filter(
      (l) => attendance[l.id]?.attended
    ).length;
    const attPct = courseLessons.length
      ? Math.round((attendedCount * 100) / courseLessons.length)
      : 0;

    const courseQuizzes = quizzes.filter((q) => q.courseId === cid);
    let quizSum = 0;
    let quizCount = 0;
    courseQuizzes.forEach((q) => {
      const res = quizResults[q.id];
      if (res && res.total > 0) {
        quizSum += res.best / res.total;
        quizCount++;
      }
    });
    const quizScorePct = quizCount ? Math.round((quizSum * 100) / quizCount) : null;

    const minAtt = course?.minAtt ?? 80;
    const minScore = course?.minScore ?? 60;
    const isEligible =
      attPct >= minAtt && (quizScorePct === null || quizScorePct >= minScore);

    const cert = certificates.find(
      (c) => c.courseId === cid && c.uid === student.id
    );

    return {
      course,
      attendedCount,
      totalLessons: courseLessons.length,
      attPct,
      quizScorePct,
      minAtt,
      minScore,
      isEligible,
      cert,
    };
  };

  // Redraw certificates onto canvases
  useEffect(() => {
    enrolledCourses.forEach((c) => {
      const stats = getCourseStats(c.id);
      const canvas = canvasRefs.current[c.id];
      if (canvas && stats.cert) {
        const texts = getCertTexts(site, c, stats.cert, student?.name || 'طالب المنصة', false);
        drawCertificate(canvas, site, certBg, texts);
      }
    });
  }, [enrolledCourses, certificates, student?.name, site, certBg]);

  const handleDownload = (courseId: string) => {
    const canvas = canvasRefs.current[courseId];
    if (canvas) {
      downloadCanvasAsPng(canvas, `شهادة-${courseId}.png`);
    }
  };

  return (
    <div className="grid gap-4">
      {/* Student Name Card */}
      <form
        onSubmit={handleSaveName}
        className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
      >
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-base font-bold font-display text-[var(--fg)] m-0">
            اسمك الكامل المعتمد على الشهادة
          </h2>
        </div>
        <p className="text-xs text-[var(--muted)] m-0 leading-relaxed">
          اكتب اسمك الثلاثي أو الرباعي بدقة كما ترغب أن يظهر في وثيقة الشهادة الرسمية.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="مثال: نادية بنت عبد الله الرويلي"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-sm text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            حفظ الاسم
          </button>
        </div>
        {savedSuccess && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium m-0 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            تم حفظ اسمك وتحديث معاينة الشهادات بنجاح.
          </p>
        )}
      </form>

      {/* Courses & Certificates List */}
      {enrolledCourses.length > 0 ? (
        enrolledCourses.map((course) => {
          const stats = getCourseStats(course.id);
          const isIssued = !!stats.cert;

          return (
            <div
              key={course.id}
              className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-4 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
                <div>
                  <span className="text-[11px] font-semibold text-[var(--muted)]">
                    دورة تدريبية
                  </span>
                  <h3 className="text-base font-bold font-display text-[var(--fg)] m-0 mt-0.5">
                    {course.title}
                  </h3>
                </div>

                {isIssued ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    صدرت الشهادة
                  </span>
                ) : stats.isEligible ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    مستحقة للإصدار
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    قيد الدراسة
                  </span>
                )}
              </div>

              {/* Progress bars */}
              <div className="grid gap-3">
                {/* Attendance */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[var(--muted)]">نسبة الحضور المنجزة</span>
                    <span className="font-bold font-mono">
                      {stats.attPct}% (المطلوب {stats.minAtt}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--accent-soft)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, stats.attPct)}%`,
                        backgroundColor:
                          stats.attPct >= stats.minAtt
                            ? 'var(--ok)'
                            : 'var(--accent)',
                      }}
                    />
                  </div>
                </div>

                {/* Quizzes */}
                {stats.quizScorePct !== null && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[var(--muted)]">معدل الاختبارات</span>
                      <span className="font-bold font-mono">
                        {stats.quizScorePct}% (المطلوب {stats.minScore}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--accent-soft)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, stats.quizScorePct)}%`,
                          backgroundColor:
                            stats.quizScorePct >= stats.minScore
                              ? 'var(--ok)'
                              : 'var(--accent)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Canvas and download if issued */}
              {isIssued ? (
                <div className="grid gap-3 pt-2">
                  <div className="rounded-xl overflow-hidden border border-[var(--line)] shadow-xs bg-white">
                    <canvas
                      ref={(el) => {
                        canvasRefs.current[course.id] = el;
                      }}
                      className="w-full h-auto block"
                      aria-label={`شهادة ${course.title}`}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownload(course.id)}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <Download className="w-4 h-4" />
                      حفظ الشهادة كصورة PNG عالية الدقة
                    </button>
                    <span className="text-[11px] text-[var(--muted)] font-mono">
                      الرقم: {stats.cert?.serial}
                    </span>
                  </div>
                </div>
              ) : stats.isEligible ? (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200 text-xs leading-relaxed">
                  تهانينا! لقد حققت نسبة الحضور والدرجات المطلوبة. سيقوم المشرف أو إدارة المنصة بمراجعة السجل واعتماد إصدار الشهادة رسميًا لتظهر هنا.
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] text-xs leading-relaxed">
                  للحصول على شهادة الإتمام، يلزم حضور {stats.minAtt}% من الدروس على الأقل والحصول على معدل اختبارات لا يقل عن {stats.minScore}%.
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="p-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-center text-sm text-[var(--muted)]">
          <p className="m-0 mb-3">سجّل في إحدى الدورات لتتابع نسبة حضورك وتستحق الشهادة.</p>
          <button
            type="button"
            onClick={() => onNavigateTab('courses')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            تصفح الدورات الآن
          </button>
        </div>
      )}
    </div>
  );
};
