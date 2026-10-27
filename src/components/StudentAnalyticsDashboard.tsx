import React, { useState, useMemo } from 'react';
import {
  Student,
  Lesson,
  Quiz,
  Course,
  AttendanceRecord,
  QuizResult,
  Certificate,
  UserAccount,
  Role,
} from '../types';
import { formatLongDate, formatDateKey } from '../storage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  User,
  GraduationCap,
  ChevronDown,
  X,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';

interface StudentAnalyticsDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
  role: Role;
  students: Student[];
  users: UserAccount[];
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  attendance: Record<string, Record<string, AttendanceRecord>>;
  quizResults: Record<string, Record<string, QuizResult>>;
  certificates: Certificate[];
  initialStudentId?: string | null;
  onIssueCertificate?: (courseId: string, uid: string) => void;
}

export const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({
  isOpen = true,
  onClose,
  role,
  students,
  users,
  courses,
  lessons,
  quizzes,
  attendance,
  quizResults,
  certificates,
  initialStudentId,
  onIssueCertificate,
}) => {
  // STRICT ACCESS CONTROL: Only owner and teacher can view
  const isAuthorized = role === 'owner' || role === 'teacher';

  // Merge students list with users having role === 'student' to ensure complete list
  const allStudents = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email?: string; joinedAt?: number }>();
    students.forEach((s) => {
      map.set(s.id, {
        id: s.id,
        name: s.name || 'طالب',
        email: s.email,
        joinedAt: s.joinedAt,
      });
    });
    users
      .filter((u) => u.role === 'student')
      .forEach((u) => {
        if (!map.has(u.id)) {
          map.set(u.id, {
            id: u.id,
            name: u.name || 'طالب',
            email: u.email,
            joinedAt: u.joinedAt,
          });
        } else {
          // enrich with email if missing
          const existing = map.get(u.id)!;
          if (!existing.email && u.email) existing.email = u.email;
          if (!existing.joinedAt && u.joinedAt) existing.joinedAt = u.joinedAt;
        }
      });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [students, users]);

  // Selected student state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    if (initialStudentId && allStudents.some((s) => s.id === initialStudentId)) {
      return initialStudentId;
    }
    return allStudents[0]?.id || '';
  });

  // Selected course filter (all courses vs specific course)
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [activeChartTab, setActiveChartTab] = useState<'both' | 'attendance' | 'quizzes'>('both');

  // If initialStudentId prop changes, sync it
  React.useEffect(() => {
    if (initialStudentId && allStudents.some((s) => s.id === initialStudentId)) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId, allStudents]);

  if (!isOpen) return null;

  if (!isAuthorized) {
    return (
      <div className="p-6 rounded-3xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-center grid gap-3 max-w-lg mx-auto my-6 shadow-sm">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold m-0 font-display">عذراً، هذه اللوحة مخصصة للمعلم والمالك فقط</h3>
        <p className="text-xs text-rose-700 dark:text-rose-300 m-0">
          تحليلات أداء الطلاب والرسوم البيانية التراكمية متاحة حصراً للكادر التعليمي والإداري.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 mt-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
          >
            إغلاق
          </button>
        )}
      </div>
    );
  }

  const currentStudent = allStudents.find((s) => s.id === selectedStudentId);

  // Filter lessons based on course filter
  const relevantLessons = useMemo(() => {
    const list = selectedCourseId === 'all'
      ? [...lessons]
      : lessons.filter((l) => l.courseId === selectedCourseId);
    // Sort chronologically by date
    return list.sort((a, b) => {
      const dateA = a.date || '1970-01-01';
      const dateB = b.date || '1970-01-01';
      return dateA.localeCompare(dateB);
    });
  }, [lessons, selectedCourseId]);

  // Filter quizzes based on course filter
  const relevantQuizzes = useMemo(() => {
    const list = selectedCourseId === 'all'
      ? [...quizzes]
      : quizzes.filter((q) => q.courseId === selectedCourseId);
    return list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }, [quizzes, selectedCourseId]);

  // Attendance analytics data for recharts
  const studentAttMap = (selectedStudentId ? attendance[selectedStudentId] : null) || {};

  const attendanceChartData = useMemo(() => {
    let attendedCount = 0;
    return relevantLessons.map((lesson, index) => {
      const isAttended = !!studentAttMap[lesson.id]?.attended;
      if (isAttended) attendedCount++;
      const cumulativePct = Math.round((attendedCount / (index + 1)) * 100);
      const courseObj = courses.find((c) => c.id === lesson.courseId);

      return {
        lessonId: lesson.id,
        lessonName: lesson.title.length > 20 ? `${lesson.title.slice(0, 18)}...` : lesson.title,
        fullTitle: lesson.title,
        courseName: courseObj?.title || 'عام',
        date: lesson.date || 'غير محدد',
        attendedStatus: isAttended ? 100 : 0,
        isAttended,
        attendedCount,
        totalLessonsSoFar: index + 1,
        cumulativePct,
        targetRate: courseObj?.minAtt ?? 80,
      };
    });
  }, [relevantLessons, studentAttMap, courses]);

  // Quiz results analytics data for recharts
  const studentQuizMap = (selectedStudentId ? quizResults[selectedStudentId] : null) || {};

  const quizChartData = useMemo(() => {
    return relevantQuizzes.map((quiz, index) => {
      const result = studentQuizMap[quiz.id];
      const courseObj = courses.find((c) => c.id === quiz.courseId);
      const minPassing = courseObj?.minScore ?? 60;

      let scorePct = 0;
      let bestPct = 0;
      let hasAttempted = false;

      if (result && result.total > 0) {
        hasAttempted = true;
        scorePct = Math.round((result.score / result.total) * 100);
        bestPct = Math.round((result.best / result.total) * 100);
      }

      return {
        quizId: quiz.id,
        quizTitle: quiz.title.length > 18 ? `${quiz.title.slice(0, 16)}...` : quiz.title,
        fullTitle: quiz.title,
        courseName: courseObj?.title || 'عام',
        scorePct,
        bestPct,
        hasAttempted,
        minPassing,
        totalQuestions: result?.total || quiz.questions.length,
        rawScore: result?.score ?? 0,
        rawBest: result?.best ?? 0,
        attemptDate: result?.at ? formatDateKey(new Date(result.at)) : 'لم يختبر',
        passed: bestPct >= minPassing,
      };
    });
  }, [relevantQuizzes, studentQuizMap, courses]);

  // Overall KPIs for the selected student
  const totalLessonsCount = relevantLessons.length;
  const attendedLessonsCount = relevantLessons.filter((l) => studentAttMap[l.id]?.attended).length;
  const overallAttendancePct = totalLessonsCount > 0
    ? Math.round((attendedLessonsCount / totalLessonsCount) * 100)
    : 0;

  const attemptedQuizzes = quizChartData.filter((q) => q.hasAttempted);
  const avgQuizScore = attemptedQuizzes.length > 0
    ? Math.round(attemptedQuizzes.reduce((acc, q) => acc + q.bestPct, 0) / attemptedQuizzes.length)
    : 0;
  const passedQuizzesCount = attemptedQuizzes.filter((q) => q.passed).length;

  const studentCerts = certificates.filter(
    (c) => c.uid === selectedStudentId && (selectedCourseId === 'all' || c.courseId === selectedCourseId)
  );

  // Performance progression evaluation
  let performanceStatus = {
    label: 'مستوى متميز ومستمر',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    icon: <ArrowUpRight className="w-4 h-4 text-emerald-600" />,
  };

  if (overallAttendancePct < 60 || (attemptedQuizzes.length > 0 && avgQuizScore < 60)) {
    performanceStatus = {
      label: 'يحتاج إلى متابعة وتحفيز',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      icon: <ArrowDownRight className="w-4 h-4 text-rose-600" />,
    };
  } else if (overallAttendancePct < 80 || (attemptedQuizzes.length > 0 && avgQuizScore < 75)) {
    performanceStatus = {
      label: 'مستوى متوسط في تطور',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
    };
  }

  return (
    <div className="grid gap-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold font-display text-[var(--fg)] m-0">
                لوحة تحكم وتحليلات أداء الطالب
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                خاص بالمعلم والمالك
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
              رسوم بيانية تفاعلية باستخدام Recharts لمتابعة تطور الحضور ونقاط الاختبارات لحظياً
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-center p-2 rounded-xl text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-soft)] transition-colors"
            title="إغلاق اللوحة"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selectors Bar: Choose Student & Filter Course */}
      <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Student Selector */}
        <div className="md:col-span-6 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>اختر الطالب لعرض رسومه البيانية:</span>
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {allStudents.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.name} {stu.email ? `(${stu.email})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Course Filter */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>تصفية الدورة / المادة:</span>
          </label>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="all">كافة المقررات والمحاضرات</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[var(--muted)]">نوع الرسم البياني:</label>
          <div className="flex rounded-xl bg-[var(--bg)] p-1 border border-[var(--line)] text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveChartTab('both')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeChartTab === 'both' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('attendance')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeChartTab === 'attendance' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'
              }`}
            >
              الحضور
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('quizzes')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeChartTab === 'quizzes' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'
              }`}
            >
              الاختبارات
            </button>
          </div>
        </div>
      </div>

      {/* Selected Student Profile Summary Card */}
      {currentStudent && (
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-teal-700 text-white font-display font-bold text-lg flex items-center justify-center shadow-xs">
              {currentStudent.name.charAt(0) || 'ط'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-[var(--fg)] font-display">
                  {currentStudent.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${performanceStatus.bg} ${performanceStatus.color}`}
                >
                  {performanceStatus.icon}
                  {performanceStatus.label}
                </span>
              </div>
              <div className="text-xs text-[var(--muted)] flex items-center gap-3 mt-1 flex-wrap">
                {currentStudent.email && <span>{currentStudent.email}</span>}
                {currentStudent.joinedAt && (
                  <span>
                    انضم: {formatLongDate(formatDateKey(new Date(currentStudent.joinedAt)))}
                  </span>
                )}
                <span>معرّف الطالب: #{currentStudent.id.slice(-6)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {studentCerts.length > 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{studentCerts.length} شهادات صادرة</span>
              </span>
            ) : (
              selectedCourseId !== 'all' &&
              onIssueCertificate && (
                <button
                  type="button"
                  onClick={() => onIssueCertificate(selectedCourseId, currentStudent.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-transform hover:scale-105"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>إصدار شهادة المقرر</span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Attendance Rate */}
        <div className="p-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">نسبة الحضور الإجمالية</span>
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-bold font-display" style={{ color: 'var(--accent)' }}>
              {overallAttendancePct}%
            </span>
            <div className="w-full h-1.5 rounded-full bg-[var(--line)] overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallAttendancePct}%`,
                  backgroundColor: overallAttendancePct >= 80 ? 'var(--accent)' : overallAttendancePct >= 60 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            حضر {attendedLessonsCount} من أصل {totalLessonsCount} درس
          </span>
        </div>

        {/* Average Quiz Score */}
        <div className="p-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">متوسط درجات الاختبارات</span>
            <HelpCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-purple-600 dark:text-purple-400">
              {avgQuizScore}%
            </span>
            <div className="w-full h-1.5 rounded-full bg-[var(--line)] overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${avgQuizScore}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            من واقع {attemptedQuizzes.length} اختبار تم تقديمه
          </span>
        </div>

        {/* Quizzes Passed */}
        <div className="p-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">الاختبارات المجتازة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {passedQuizzesCount}
              <span className="text-xs font-normal text-[var(--muted)] mr-1">/ {relevantQuizzes.length}</span>
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            نسبة النجاح:{' '}
            {relevantQuizzes.length > 0
              ? `${Math.round((passedQuizzesCount / relevantQuizzes.length) * 100)}%`
              : '0%'}
          </span>
        </div>

        {/* Certificates */}
        <div className="p-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="font-semibold">الشهادات المستحقة</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
              {studentCerts.length}
            </span>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            {studentCerts.length > 0 ? 'شهادات تخرج معتمدة' : 'لم تصدر شهادات بعد'}
          </span>
        </div>
      </div>

      {/* CHART 1: Attendance Progression Over Time */}
      {(activeChartTab === 'both' || activeChartTab === 'attendance') && (
        <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display text-[var(--fg)] m-0 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent)]" />
                <span>مخطط تطور الحضور التراكمي عبر المحاضرات</span>
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                يوضح التطور الزمني لنسبة التزام الطالب بحضور الدروس مقارنة بحد النجاح المطلوب (80%)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-[var(--fg)] font-semibold">
                <span className="w-3 h-3 rounded-full bg-[var(--accent)]"></span>
                نسبة الحضور التراكمية (%)
              </span>
              <span className="inline-flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="w-3 h-0.5 bg-rose-500 border-t border-dashed"></span>
                حد الحضور المطلوب (80%)
              </span>
            </div>
          </div>

          {attendanceChartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              لا توجد محاضرات مجدولة لهذا المقرر حالياً لعرض مخطط الحضور.
            </div>
          ) : (
            <div className="w-full h-72 sm:h-80" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceChartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="attGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis
                    dataKey="lessonName"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    height={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            dir="rtl"
                            className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-lg text-xs grid gap-1.5 min-w-[200px]"
                          >
                            <span className="font-bold text-[var(--fg)] border-b border-[var(--line)] pb-1">
                              {data.fullTitle}
                            </span>
                            <div className="flex items-center justify-between text-[var(--muted)]">
                              <span>التاريخ:</span>
                              <span className="font-mono">{data.date}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>حالة الحضور:</span>
                              <span
                                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                  data.isAttended
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                }`}
                              >
                                {data.isAttended ? 'حاضر ✓' : 'غائب ✗'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-bold pt-1 border-t border-[var(--line)]">
                              <span>المعدل التراكمي:</span>
                              <span style={{ color: 'var(--accent)' }}>{data.cumulativePct}%</span>
                            </div>
                            <span className="text-[10px] text-[var(--muted)]">
                              (حضر {data.attendedCount} من أول {data.totalLessonsSoFar} محاضرة)
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: 'الحد الأدنى 80%',
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativePct"
                    name="نسبة الحضور التراكمية"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attGradient)"
                    dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* CHART 2: Quiz & Test Scores Progression */}
      {(activeChartTab === 'both' || activeChartTab === 'quizzes') && (
        <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-display text-[var(--fg)] m-0 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-500" />
                <span>مخطط درجات الاختبارات وتطور المستوى الأكاديمي</span>
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                يقارن الدرجة المحققة لكل اختبار مع أفضل محاولة وحد النجاح المعتمد (60%)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-purple-600 font-semibold">
                <span className="w-3 h-3 rounded-md bg-purple-500"></span>
                أفضل نتيجة (%)
              </span>
              <span className="inline-flex items-center gap-1.5 text-blue-500 font-semibold">
                <span className="w-3 h-3 rounded-md bg-blue-400"></span>
                الدرجة الحالية (%)
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
                <span className="w-3 h-0.5 bg-amber-500 border-t border-dashed"></span>
                حد النجاح (60%)
              </span>
            </div>
          </div>

          {quizChartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              لا توجد اختبارات متاحة لهذا المقرر حالياً.
            </div>
          ) : (
            <div className="w-full h-72 sm:h-80" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={quizChartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" />
                  <XAxis
                    dataKey="quizTitle"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    height={50}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'var(--muted)' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            dir="rtl"
                            className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-lg text-xs grid gap-1.5 min-w-[210px]"
                          >
                            <span className="font-bold text-[var(--fg)] border-b border-[var(--line)] pb-1">
                              {data.fullTitle}
                            </span>
                            <div className="flex items-center justify-between text-[var(--muted)]">
                              <span>المقرر:</span>
                              <span>{data.courseName}</span>
                            </div>
                            <div className="flex items-center justify-between text-[var(--muted)]">
                              <span>تاريخ المحاولة:</span>
                              <span className="font-mono">{data.attemptDate}</span>
                            </div>
                            {data.hasAttempted ? (
                              <>
                                <div className="flex items-center justify-between font-bold text-purple-600 dark:text-purple-400">
                                  <span>أعلى درجة:</span>
                                  <span>
                                    {data.bestPct}% ({data.rawBest}/{data.totalQuestions})
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>حالة الاجتياز:</span>
                                  <span
                                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                      data.passed
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    }`}
                                  >
                                    {data.passed ? 'ناجح ومجتاز ✓' : 'دون حد النجاح ✗'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-center font-bold text-[11px]">
                                لم يقم الطالب بتقديم هذا الاختبار بعد
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={60}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: 'حد النجاح 60%',
                      fill: '#f59e0b',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar
                    dataKey="bestPct"
                    name="أفضل درجة (%)"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="scorePct"
                    name="الدرجة الحالية (%)"
                    fill="#38bdf8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Detailed Attendance & Quizzes Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Breakdown List */}
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <h4 className="text-xs font-bold text-[var(--fg)] mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
              سجل حضور المحاضرات ({attendanceChartData.length})
            </span>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              {attendedLessonsCount} / {totalLessonsCount} حضور
            </span>
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {attendanceChartData.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">لا توجد محاضرات</p>
            ) : (
              attendanceChartData.map((item) => (
                <div
                  key={item.lessonId}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-[var(--fg)] truncate block">
                      {item.fullTitle}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {item.date} • {item.courseName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isAttended
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.isAttended ? 'حاضر' : 'غائب'}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      تراكمي: {item.cumulativePct}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quizzes Breakdown List */}
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
          <h4 className="text-xs font-bold text-[var(--fg)] mb-3 flex items-center justify-between border-b border-[var(--line)] pb-2">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              سجل نتائج الاختبارات ({quizChartData.length})
            </span>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              {passedQuizzesCount} / {quizChartData.length} مجتاز
            </span>
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {quizChartData.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">لا توجد اختبارات</p>
            ) : (
              quizChartData.map((item) => (
                <div
                  key={item.quizId}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-[var(--fg)] truncate block">
                      {item.fullTitle}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {item.attemptDate} • {item.courseName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.hasAttempted ? (
                      <>
                        <span className="font-mono font-bold text-xs" style={{ color: item.passed ? '#10b981' : '#ef4444' }}>
                          {item.bestPct}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.passed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.passed ? 'مجتاز' : 'راسب'}
                        </span>
                      </>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-semibold">
                        لم يختبر
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
