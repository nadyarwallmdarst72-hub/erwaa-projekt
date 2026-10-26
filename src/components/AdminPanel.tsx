import React, { useState, useRef, useEffect } from 'react';
import {
  SiteSettings,
  Course,
  Lesson,
  Quiz,
  Announcement,
  Student,
  Teacher,
  AttendanceRecord,
  QuizResult,
  Certificate,
  Project,
  ProjectReview,
  Role,
  CertLayout,
  UserAccount,
  OWNER_EMAIL,
  LessonExercise,
} from '../types';
import {
  formatDateKey,
  formatLongDate,
  formatShortDate,
  DEFAULT_SITE,
} from '../storage';
import {
  CERT_ELEMENTS,
  drawCertificate,
  getCertTexts,
  CertBoundingBox,
} from '../utils/certDrawer';
import {
  Users,
  BookOpen,
  CalendarDays,
  HelpCircle,
  FolderKanban,
  Megaphone,
  UserCheck,
  Palette,
  Download,
  Award,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Lock,
  Unlock,
  UserX,
  AlertCircle,
  GraduationCap,
  Clock,
  FileSpreadsheet,
  Sparkles,
  Plus,
  Lightbulb,
  FileCheck,
} from 'lucide-react';

interface AdminPanelProps {
  site: SiteSettings;
  certBg: string;
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  blocks: Announcement[];
  users: UserAccount[];
  students: Student[];
  teachers: Teacher[];
  attendance: Record<string, Record<string, AttendanceRecord>>;
  quizResults: Record<string, Record<string, QuizResult>>;
  enrolled: Record<string, Record<string, { at: number }>>;
  certificates: Certificate[];
  projects: Record<string, Project>;
  reviews: Record<string, ProjectReview>;
  role: Role;
  currentUserEmail?: string;
  onUpdateSite: (newSite: SiteSettings) => void;
  onUpdateCertBg: (bgDataUrl: string) => void;
  onSaveCourse: (course: Partial<Course>, id?: string) => void;
  onDeleteCourse: (id: string) => void;
  onSaveLesson: (lesson: Partial<Lesson>, id?: string) => void;
  onDeleteLesson: (id: string) => void;
  onSaveQuiz: (quiz: Partial<Quiz>, id?: string) => void;
  onDeleteQuiz: (id: string) => void;
  onSaveBlock: (block: Partial<Announcement>, id?: string) => void;
  onDeleteBlock: (id: string) => void;
  onSaveReview: (projectId: string, review: ProjectReview) => void;
  onIssueCertificate: (courseId: string, uid: string) => void;
  onAssignTeacherCourses: (teacherId: string, courseIds: string[]) => void;
  onApproveUser: (uid: string) => void;
  onSuspendUser: (uid: string, suspend: boolean) => void;
  onDeleteUser: (uid: string) => void;
  onPromoteUser: (uid: string, newRole: Role) => void;
  onResetAllData: () => void;
  onOpenImportExcel?: () => void;
  onOpenAiAssistant?: () => void;
}

type AdminTab =
  | 'users'
  | 'students'
  | 'courses'
  | 'lessons'
  | 'quizzes'
  | 'projects'
  | 'blocks'
  | 'teachers'
  | 'site';

const COLOR_SWATCHES = [
  '#1B8576',
  '#2563A6',
  '#6B4FA0',
  '#B4532A',
  '#B03060',
  '#3B7A2A',
  '#C58A00',
  '#374151',
];

const ARABIC_FONTS = [
  'IBM Plex Sans Arabic',
  'Noto Kufi Arabic',
  'Tajawal',
  'Cairo',
  'Amiri',
  'Noto Naskh Arabic',
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  site,
  certBg,
  courses,
  lessons,
  quizzes,
  blocks,
  users,
  students,
  teachers,
  attendance,
  quizResults,
  enrolled,
  certificates,
  projects,
  reviews,
  role,
  currentUserEmail,
  onUpdateSite,
  onUpdateCertBg,
  onSaveCourse,
  onDeleteCourse,
  onSaveLesson,
  onDeleteLesson,
  onSaveQuiz,
  onDeleteQuiz,
  onSaveBlock,
  onDeleteBlock,
  onSaveReview,
  onIssueCertificate,
  onAssignTeacherCourses,
  onApproveUser,
  onSuspendUser,
  onDeleteUser,
  onPromoteUser,
  onResetAllData,
  onOpenImportExcel,
  onOpenAiAssistant,
}) => {
  const isOwner = role === 'owner' || currentUserEmail?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const [activeTab, setActiveTab] = useState<AdminTab>(isOwner ? 'users' : 'students');

  // Course filter for Students & Projects tabs
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
  const [selectedStudentDrilldownId, setSelectedStudentDrilldownId] = useState<string | null>(null);

  // Review Modal State
  const [reviewingProject, setReviewingProject] = useState<Project | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'reviewed' | 'returned'>('reviewed');
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Course Form
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cTeacher, setCTeacher] = useState('');
  const [cMinAtt, setCMinAtt] = useState(80);
  const [cMinScore, setCMinScore] = useState(60);

  // Lesson Form
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lTitle, setLTitle] = useState('');
  const [lCourseId, setLCourseId] = useState(courses[0]?.id || '');
  const [lDate, setLDate] = useState(formatDateKey(new Date()));
  const [lUrl, setLUrl] = useState('');
  const [lExercises, setLExercises] = useState<LessonExercise[]>([]);

  // Announcement Form
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [bTitle, setBTitle] = useState('');
  const [bText, setBText] = useState('');
  const [bLabel, setBLabel] = useState('');
  const [bUrl, setBUrl] = useState('');
  const [bCourseId, setBCourseId] = useState('');

  // Quiz Form
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [qTitle, setQTitle] = useState('');
  const [qCourseId, setQCourseId] = useState(courses[0]?.id || '');
  const [qMinutes, setQMinutes] = useState<number | ''>(15);
  const [qSingle, setQSingle] = useState(false);
  const [qQuestions, setQQuestions] = useState<
    { q: string; opts: string[]; ans: number }[]
  >([
    {
      q: '',
      opts: ['', '', '', ''],
      ans: 0,
    },
  ]);

  // Site Designer State (Working Draft)
  const [siteDraft, setSiteDraft] = useState<SiteSettings>(() => JSON.parse(JSON.stringify(site)));
  const [certBgDraft, setCertBgDraft] = useState<string>(certBg);
  const [selectedCertElem, setSelectedCertElem] = useState<keyof CertLayout>('name');
  const [siteSavedMsg, setSiteSavedMsg] = useState(false);

  // Canvas ref for certificate interactive preview
  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const certBoxesRef = useRef<CertBoundingBox[]>([]);
  const isDraggingRef = useRef<{
    k: keyof CertLayout;
    dx: number;
    dy: number;
  } | null>(null);

  useEffect(() => {
    setSiteDraft(JSON.parse(JSON.stringify(site)));
  }, [site]);

  useEffect(() => {
    setCertBgDraft(certBg);
  }, [certBg]);

  // Draw certificate live preview in admin
  const renderCertPreview = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const texts = getCertTexts(siteDraft, courses[0] || null, null, 'نادية الرويلي', true);
    drawCertificate(canvas, siteDraft, certBgDraft, texts, selectedCertElem).then((boxes) => {
      certBoxesRef.current = boxes;
    });
  };

  useEffect(() => {
    if (activeTab === 'site') {
      renderCertPreview();
    }
  }, [activeTab, siteDraft, certBgDraft, selectedCertElem]);

  // Pointer drag events on canvas
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const py = ((e.clientY - rect.top) * canvas.height) / rect.height;

    const boxes = certBoxesRef.current || [];
    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i];
      if (px >= b.x0 && px <= b.x1 && py >= b.y0 && py <= b.y1) {
        setSelectedCertElem(b.k);
        isDraggingRef.current = { k: b.k, dx: px - b.cx, dy: py - b.cy };
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
        e.preventDefault();
        renderCertPreview();
        return;
      }
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const py = ((e.clientY - rect.top) * canvas.height) / rect.height;

    const drag = isDraggingRef.current;
    const newX = Math.min(
      100,
      Math.max(0, Math.round(((px - drag.dx) / canvas.width) * 1000) / 10)
    );
    const newY = Math.min(
      100,
      Math.max(0, Math.round(((py - drag.dy) / canvas.height) * 1000) / 10)
    );

    setSiteDraft((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.cert.layout[drag.k].x = newX;
      copy.cert.layout[drag.k].y = newY;
      return copy;
    });
  };

  const handleCanvasPointerUp = () => {
    isDraggingRef.current = null;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSiteDraft((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClubImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSiteDraft((prev) => ({ ...prev, clubImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCertBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCertBgDraft(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveSiteChanges = () => {
    onUpdateSite(siteDraft);
    onUpdateCertBg(certBgDraft);
    setSiteSavedMsg(true);
    setTimeout(() => setSiteSavedMsg(false), 3000);
  };

  const handleExportCsv = () => {
    const filteredLessons = lessons.filter(
      (l) => selectedCourseFilter === 'all' || l.courseId === selectedCourseFilter
    );

    const headers = [
      'اسم الطالب',
      'البريد الإلكتروني',
      'تاريخ الانضمام',
      ...filteredLessons.map((l) => `${l.date} ${l.title}`),
      'نسبة الحضور %',
      'شهادات صادرة',
    ];

    const rows = students.map((s) => {
      const userAtt = attendance[s.id] || {};
      let attendedCount = 0;
      const lessonChecks = filteredLessons.map((l) => {
        const isAtt = !!userAtt[l.id]?.attended;
        if (isAtt) attendedCount++;
        return isAtt ? '1' : '0';
      });

      const attPct = filteredLessons.length
        ? Math.round((attendedCount * 100) / filteredLessons.length)
        : 0;

      const certsCount = certificates.filter(
        (c) =>
          c.uid === s.id &&
          (selectedCourseFilter === 'all' || c.courseId === selectedCourseFilter)
      ).length;

      return [
        `"${s.name || 'بدون اسم'}"`,
        `"${s.email || ''}"`,
        `"${s.joinedAt ? formatShortDate(s.joinedAt) : ''}"`,
        ...lessonChecks,
        `"${attPct}%"`,
        `"${certsCount}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `كشف-حضور-إرواء-${formatDateKey(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Pending users count for owner
  const pendingUsers = users.filter((u) => u.status === 'pending');

  const totalStudents = students.length;
  let totalAttPctSum = 0;
  students.forEach((s) => {
    const userAtt = attendance[s.id] || {};
    const relevantLessons = lessons.filter(
      (l) => selectedCourseFilter === 'all' || l.courseId === selectedCourseFilter
    );
    const count = relevantLessons.filter((l) => userAtt[l.id]?.attended).length;
    const pct = relevantLessons.length ? (count * 100) / relevantLessons.length : 0;
    totalAttPctSum += pct;
  });
  const avgAttendance = totalStudents ? Math.round(totalAttPctSum / totalStudents) : 0;

  const allProjects = Object.values(projects);
  const filteredProjects = allProjects.filter((p) => {
    const matchesCourse =
      selectedCourseFilter === 'all' || p.courseId === selectedCourseFilter;
    const rev = reviews[p.id];
    const status = !rev
      ? 'submitted'
      : (p.updatedAt || 0) > rev.at
      ? 'submitted'
      : rev.status;
    const matchesStatus =
      projectStatusFilter === 'all' || status === projectStatusFilter;
    return matchesCourse && matchesStatus;
  });

  const eligibleCertIssuances: { courseId: string; uid: string }[] = [];
  if (selectedCourseFilter !== 'all') {
    const targetCourse = courses.find((c) => c.id === selectedCourseFilter);
    const courseLessons = lessons.filter((l) => l.courseId === selectedCourseFilter);
    const courseQuizzes = quizzes.filter((q) => q.courseId === selectedCourseFilter);

    students.forEach((s) => {
      const alreadyHasCert = certificates.some(
        (c) => c.courseId === selectedCourseFilter && c.uid === s.id
      );
      if (alreadyHasCert) return;

      const userAtt = attendance[s.id] || {};
      const attendedCount = courseLessons.filter((l) => userAtt[l.id]?.attended).length;
      const attPct = courseLessons.length ? (attendedCount * 100) / courseLessons.length : 0;

      const userRes = quizResults[s.id] || {};
      let qSum = 0;
      let qCount = 0;
      courseQuizzes.forEach((q) => {
        const r = userRes[q.id];
        if (r && r.total > 0) {
          qSum += r.best / r.total;
          qCount++;
        }
      });
      const qAvg = qCount ? (qSum * 100) / qCount : 100;

      if (attPct >= (targetCourse?.minAtt ?? 80) && qAvg >= (targetCourse?.minScore ?? 60)) {
        eligibleCertIssuances.push({ courseId: selectedCourseFilter, uid: s.id });
      }
    });
  }

  return (
    <div className="grid gap-4">
      {/* Owner Badge Notice */}
      {isOwner && (
        <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold flex items-center gap-1.5 flex-wrap">
                لوحة تحكم مالك المنصة
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  قاعدة بيانات سحابية موحدة (مزامنة فورية)
                </span>
              </span>
              <span className="text-[11px] opacity-85 block">
                تصل طلبات الالتحاق لحظياً من أي هاتف أو كمبيوتر وتظهر فوراً هنا للموافقة عليها وتفعيلها دون الحاجة لإعادة تحميل الصفحة.
              </span>
            </div>
          </div>
          {pendingUsers.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex-shrink-0">
              {pendingUsers.length} طلبات جديدة
            </span>
          )}
        </div>
      )}

      {/* Quick Staff Cloud Tools Banner: Excel/Sheets Import & AI Assistant */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
            أدوات الإدارة السحابية والذكاء الاصطناعي:
          </span>
          <span className="text-[11px] text-[var(--muted)] hidden sm:inline">
            استيراد بيانات جماعية من إكسل أو توليد محتوى ذكي
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenImportExcel && (
            <button
              type="button"
              onClick={onOpenImportExcel}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>استيراد من إكسل / شيت</span>
            </button>
          )}

          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
              <span>مساعد الذكاء الاصطناعي</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs pills */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs overflow-x-auto no-scrollbar md:flex-wrap">
        {[
          ...(isOwner
            ? [
                {
                  key: 'users' as AdminTab,
                  label: `المستخدمون (${users.length})`,
                  icon: <Users className="w-4 h-4" />,
                  badge: pendingUsers.length > 0 ? pendingUsers.length : undefined,
                },
              ]
            : []),
          { key: 'students' as AdminTab, label: 'الطلاب ونسب الحضور', icon: <GraduationCap className="w-4 h-4" /> },
          { key: 'courses' as AdminTab, label: 'الدورات والمواد', icon: <BookOpen className="w-4 h-4" /> },
          { key: 'lessons' as AdminTab, label: 'الدروس والجدول', icon: <CalendarDays className="w-4 h-4" /> },
          { key: 'quizzes' as AdminTab, label: 'الاختبارات', icon: <HelpCircle className="w-4 h-4" /> },
          {
            key: 'projects' as AdminTab,
            label: 'مراجعة المشاريع',
            icon: <FolderKanban className="w-4 h-4" />,
          },
          { key: 'blocks' as AdminTab, label: 'الإعلانات', icon: <Megaphone className="w-4 h-4" /> },
          ...(isOwner
            ? [
                {
                  key: 'teachers' as AdminTab,
                  label: 'المعلمون والدورات',
                  icon: <UserCheck className="w-4 h-4" />,
                },
                {
                  key: 'site' as AdminTab,
                  label: 'الهوية ومصمم الشهادة',
                  icon: <Palette className="w-4 h-4" />,
                },
              ]
            : []),
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedStudentDrilldownId(null);
            }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-soft)]/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge ? (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            ) : null}
          </button>
        ))}
      </div>

      {/* TAB 0: USERS & ADMISSIONS (OWNER EXCLUSIVE) */}
      {activeTab === 'users' && isOwner && (
        <div className="grid gap-4">
          {/* Pending Applications Section */}
          {pendingUsers.length > 0 && (
            <div className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-sm grid gap-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm font-display m-0 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <Clock className="w-4 h-4 text-amber-600" />
                  طلبات الانضمام الجديدة بانتظار موافقتك ({pendingUsers.length})
                </h3>
                <span className="text-xs text-[var(--muted)]">بصفتك مالك الموقع</span>
              </div>
              <p className="text-xs text-[var(--muted)] m-0">
                المستخدمون الجدد لا يمكنهم الوصول للمقررات حتى يتم قبولهم واعتمادهم.
              </p>

              <div className="divide-y divide-amber-200 dark:divide-amber-800/50 bg-white dark:bg-black/30 rounded-xl border border-amber-200 dark:border-amber-900">
                {pendingUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div>
                      <span className="font-bold text-xs text-[var(--fg)] block">
                        {u.name || 'مستخدم جديد'}
                      </span>
                      <span className="text-[11px] text-[var(--muted)] font-mono" dir="ltr">
                        {u.email}
                      </span>
                      <span className="block text-[10px] text-[var(--muted)]">
                        تاريخ التسجيل: {formatShortDate(u.joinedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onApproveUser(u.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs flex items-center gap-1"
                        style={{ backgroundColor: 'var(--accent)' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        قبول وتفعيل
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من رفض وحذف طلب ${u.name || u.email}؟`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        رفض وحذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Users Directory */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
            <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)]">
              <div>
                <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                  دليل المستخدمين والصلاحيات
                </h3>
                <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                  إدارة شاملة: قبول الحسابات، ترقية الطلاب لمعلمين، تعليق/إغلاق الحسابات، وحذف المستخدمين
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                {users.length} مستخدمين
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--accent-soft)]/20 text-[var(--muted)] font-semibold">
                    <th className="p-3">المستخدم</th>
                    <th className="p-3">الرتبة والدور</th>
                    <th className="p-3">حالة الحساب</th>
                    <th className="p-3">ترقية الرتبة</th>
                    <th className="p-3">إجراءات المالك</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {users.map((u) => {
                    const isSiteOwnerAccount = u.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

                    return (
                      <tr key={u.id} className="hover:bg-[var(--accent-soft)]/20 transition-colors">
                        <td className="p-3 font-bold text-[var(--fg)]">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs flex-shrink-0"
                              style={{ backgroundColor: 'var(--accent)' }}
                            >
                              {u.name ? u.name.slice(0, 1) : 'م'}
                            </div>
                            <div>
                              <span>{u.name || 'بدون اسم'}</span>
                              <span className="block text-[11px] text-[var(--muted)] font-normal font-mono" dir="ltr">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="p-3">
                          {isSiteOwnerAccount ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              مالك الموقع
                            </span>
                          ) : u.role === 'teacher' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40">
                              <UserCheck className="w-3.5 h-3.5" />
                              معلم مشرف
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[var(--muted)] px-2 py-0.5 rounded-full bg-[var(--line)]/50">
                              طالب
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              نشط ومفعل
                            </span>
                          ) : u.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              بانتظار الموافقة
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-semibold">
                              <Lock className="w-3.5 h-3.5 text-rose-600" />
                              مغلق ومعلق
                            </span>
                          )}
                        </td>

                        {/* Promotion Controls */}
                        <td className="p-3">
                          {isSiteOwnerAccount ? (
                            <span className="text-[11px] text-[var(--muted)]">المالك الأساسي</span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => onPromoteUser(u.id, e.target.value as Role)}
                              className="text-xs px-2.5 py-1 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] font-semibold cursor-pointer"
                              title="ترقية أو تغيير دور المستخدم"
                            >
                              <option value="student">🎓 طالب</option>
                              <option value="teacher">👨‍🏫 ترقية لمعلم مشرف</option>
                            </select>
                          )}
                        </td>

                        {/* Actions: Approve / Suspend / Delete */}
                        <td className="p-3">
                          {isSiteOwnerAccount ? (
                            <span className="text-[11px] text-emerald-600 font-bold">محمي</span>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Approve if pending */}
                              {u.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => onApproveUser(u.id)}
                                  className="px-2 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                                  style={{ backgroundColor: 'var(--accent)' }}
                                  title="قبول المستخدم"
                                >
                                  قبول
                                </button>
                              )}

                              {/* Suspend / Unsuspend */}
                              {u.status === 'suspended' ? (
                                <button
                                  type="button"
                                  onClick={() => onSuspendUser(u.id, false)}
                                  className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold flex items-center gap-1"
                                  title="إلغاء الإغلاق وتفعيل الحساب"
                                >
                                  <Unlock className="w-3 h-3" />
                                  إعادة فتح
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onSuspendUser(u.id, true)}
                                  className="px-2 py-1 rounded-lg border border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold flex items-center gap-1"
                                  title="إغلاق أو تعليق الحساب"
                                >
                                  <Lock className="w-3 h-3" />
                                  إغلاق
                                </button>
                              )}

                              {/* Delete User */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `تحذير: هل أنت متأكد من رغبتك في حذف المستخدم ${u.name || u.email} نهائياً مع كافة سجلاته؟`
                                    )
                                  ) {
                                    onDeleteUser(u.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="حذف المستخدم نهائياً"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: STUDENTS & ATTENDANCE */}
      {activeTab === 'students' && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
              <span className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {totalStudents}
              </span>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">عدد الطلاب الكلي</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
              <span className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {avgAttendance}%
              </span>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">متوسط نسبة الحضور</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
              <span className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {courses.length}
              </span>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">الدورات الفعالة</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs">
              <span className="text-2xl font-bold font-display" style={{ color: 'var(--accent)' }}>
                {certificates.length}
              </span>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">شهادات صادرة</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-[var(--muted)] flex-shrink-0">
                تصفية حسب الدورة:
              </label>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]"
              >
                <option value="all">جميع الدورات التدريبية</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--fg)] hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                تصدير ملف CSV
              </button>

              {selectedCourseFilter !== 'all' && (
                <button
                  type="button"
                  disabled={eligibleCertIssuances.length === 0}
                  onClick={() => {
                    eligibleCertIssuances.forEach((item) =>
                      onIssueCertificate(item.courseId, item.uid)
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 disabled:opacity-40"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  <Award className="w-3.5 h-3.5" />
                  إصدار الشهادات للمستحقين ({eligibleCertIssuances.length})
                </button>
              )}
            </div>
          </div>

          {/* Students Table */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--accent-soft)]/20 text-[var(--muted)] font-semibold">
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">الدورات المسجل بها</th>
                    <th className="p-3">نسبة الحضور</th>
                    <th className="p-3">الشهادات الصادرة</th>
                    <th className="p-3">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {students.map((stu) => {
                    const userAtt = attendance[stu.id] || {};
                    const relevantLessons = lessons.filter(
                      (l) => selectedCourseFilter === 'all' || l.courseId === selectedCourseFilter
                    );
                    const attCount = relevantLessons.filter((l) => userAtt[l.id]?.attended).length;
                    const attPct = relevantLessons.length
                      ? Math.round((attCount * 100) / relevantLessons.length)
                      : 0;
                    const stuEnrolled = enrolled[stu.id] || {};
                    const stuCerts = certificates.filter(
                      (c) =>
                        c.uid === stu.id &&
                        (selectedCourseFilter === 'all' || c.courseId === selectedCourseFilter)
                    );

                    return (
                      <tr key={stu.id} className="hover:bg-[var(--accent-soft)]/20 transition-colors">
                        <td className="p-3 font-bold text-[var(--fg)]">
                          {stu.name || 'طالب بدون اسم'}
                          <span className="block text-[11px] text-[var(--muted)] font-normal">
                            {stu.email}
                          </span>
                        </td>
                        <td className="p-3 text-[var(--muted)]">
                          {Object.keys(stuEnrolled).length} دورات
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">{attPct}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${attPct}%`,
                                  backgroundColor: 'var(--accent)',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-semibold">
                          {stuCerts.length > 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {stuCerts.length} شهادة
                            </span>
                          ) : (
                            <span className="text-[var(--muted)]">لا يوجد</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStudentDrilldownId(
                                selectedStudentDrilldownId === stu.id ? null : stu.id
                              )
                            }
                            className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                          >
                            {selectedStudentDrilldownId === stu.id ? 'إخفاء التفاصيل' : 'عرض السجل'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Detailed Drilldown Card */}
          {selectedStudentDrilldownId && (() => {
            const stu = students.find((s) => s.id === selectedStudentDrilldownId);
            if (!stu) return null;
            const stuEnrolled = enrolled[stu.id] || {};
            const userAtt = attendance[stu.id] || {};

            return (
              <div className="p-5 rounded-2xl border border-[var(--accent)] bg-[var(--surface)] shadow-md grid gap-4 animate-slide-up">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                  <div>
                    <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                      السجل الأكاديمي للطالب: {stu.name || 'بدون اسم'}
                    </h3>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                      تاريخ الانضمام: {stu.joinedAt ? formatLongDate(formatDateKey(new Date(stu.joinedAt))) : '—'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentDrilldownId(null)}
                    className="text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                  >
                    إغلاق التفاصيل
                  </button>
                </div>

                <div className="grid gap-3">
                  {courses
                    .filter((c) => selectedCourseFilter === 'all' || c.id === selectedCourseFilter)
                    .map((c) => {
                      const isEnrolled = !!stuEnrolled[c.id];
                      const cLessons = lessons.filter((l) => l.courseId === c.id);
                      const attended = cLessons.filter((l) => userAtt[l.id]?.attended).length;
                      const pct = cLessons.length ? Math.round((attended * 100) / cLessons.length) : 0;
                      const hasCert = certificates.find(
                        (cert) => cert.courseId === c.id && cert.uid === stu.id
                      );

                      return (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 grid gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[var(--fg)]">
                              {c.title}
                            </span>
                            {hasCert ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                شهادة صادرة ({hasCert.serial})
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onIssueCertificate(c.id, stu.id)}
                                className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                                style={{ backgroundColor: 'var(--accent)' }}
                              >
                                إصدار الشهادة يدويًا
                              </button>
                            )}
                          </div>

                          <div className="text-xs text-[var(--muted)]">
                            حالة الحضور: {attended} من {cLessons.length} درس ({pct}%)
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {cLessons.map((l) => {
                              const isAtt = !!userAtt[l.id]?.attended;
                              return (
                                <span
                                  key={l.id}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                                    isAtt
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {isAtt ? '✓' : '✗'} {l.title}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="grid gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!cTitle.trim()) return;
              onSaveCourse(
                {
                  title: cTitle.trim(),
                  desc: cDesc.trim(),
                  teacher: cTeacher.trim(),
                  minAtt: cMinAtt,
                  minScore: cMinScore,
                },
                editingCourseId || undefined
              );
              setEditingCourseId(null);
              setCTitle('');
              setCDesc('');
              setCTeacher('');
            }}
            className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
          >
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              {editingCourseId ? 'تعديل الدورة التدريبية' : 'إضافة دورة تدريبية جديدة'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                اسم الدورة
                <input
                  type="text"
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  placeholder="مثال: الأمن السيبراني المتقدم"
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  required
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                اسم المعلم المشرف (للعرض)
                <input
                  type="text"
                  value={cTeacher}
                  onChange={(e) => setCTeacher(e.target.value)}
                  placeholder="مثال: د. عبد الله الغامدي"
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              وصف مختصر عن الدورة
              <input
                type="text"
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
                placeholder="أهداف ومخرجات الدورة..."
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                أقل نسبة حضور للشهادة %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={cMinAtt}
                  onChange={(e) => setCMinAtt(Number(e.target.value))}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                أقل معدل اختبارات للشهادة %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={cMinScore}
                  onChange={(e) => setCMinScore(Number(e.target.value))}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {editingCourseId ? 'حفظ التعديلات' : 'إضافة الدورة'}
              </button>
              {editingCourseId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourseId(null);
                    setCTitle('');
                    setCDesc('');
                    setCTeacher('');
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          {/* Courses List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs divide-y divide-[var(--line)]">
            {courses.map((c) => {
              const count = lessons.filter((l) => l.courseId === c.id).length;
              return (
                <div key={c.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--fg)] m-0">{c.title}</h4>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                      {c.teacher ? `المشرف: ${c.teacher} · ` : ''}
                      {count} دروس · متطلبات الشهادة: حضور {c.minAtt}% ومعدل {c.minScore}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourseId(c.id);
                        setCTitle(c.title);
                        setCDesc(c.desc || '');
                        setCTeacher(c.teacher || '');
                        setCMinAtt(c.minAtt || 80);
                        setCMinScore(c.minScore || 60);
                      }}
                      className="p-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
                          onDeleteCourse(c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-xs font-semibold text-[var(--bad)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LESSONS MANAGEMENT */}
      {activeTab === 'lessons' && (
        <div className="grid gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!lTitle.trim() || !lDate) return;
              onSaveLesson(
                {
                  title: lTitle.trim(),
                  courseId: lCourseId,
                  date: lDate,
                  url: lUrl.trim(),
                },
                editingLessonId || undefined
              );
              setEditingLessonId(null);
              setLTitle('');
              setLUrl('');
            }}
            className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
          >
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              {editingLessonId ? 'تعديل الدرس' : 'إضافة درس تعليمي جديد'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                عنوان الدرس
                <input
                  type="text"
                  value={lTitle}
                  onChange={(e) => setLTitle(e.target.value)}
                  placeholder="مثال: بناء النماذج وتأكيد الحقول"
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  required
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                الدورة التابع لها
                <select
                  value={lCourseId}
                  onChange={(e) => setLCourseId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                تاريخ الدرس بالتقويم
                <input
                  type="date"
                  value={lDate}
                  onChange={(e) => setLDate(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  required
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                رابط الفيديو على يوتيوب
                <input
                  type="url"
                  dir="ltr"
                  value={lUrl}
                  onChange={(e) => setLUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>
            </div>

            {/* Exercises Field for this Lecture */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3.5 grid gap-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-bold text-[var(--fg)]">
                    تمارين وتطبيقات المحاضرة ({lExercises.length})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {onOpenAiAssistant && (
                    <button
                      type="button"
                      onClick={onOpenAiAssistant}
                      className="px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[11px] font-bold hover:bg-purple-100 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>توليد بالذكاء الاصطناعي</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setLExercises((prev) => [
                        ...prev,
                        {
                          id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                          title: '',
                          description: '',
                          solutionHint: '',
                        },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-bold hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة تمرين</span>
                  </button>
                </div>
              </div>

              {lExercises.length === 0 ? (
                <p className="text-[11px] text-[var(--muted)] m-0 text-center py-2 border border-dashed border-[var(--line)] rounded-lg">
                  لا توجد تمارين مضافة لهذه المحاضرة بعد. انقر على «إضافة تمرين» أو استخدم المساعد الذكي.
                </p>
              ) : (
                <div className="grid gap-2">
                  {lExercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] grid gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--fg)]">
                          تمرين #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setLExercises((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="حذف هذا التمرين"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ex.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLExercises((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                          );
                        }}
                        placeholder="عنوان التمرين (مثال: تطبيق عملي على بناء النموذج)"
                        className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                        required
                      />

                      <textarea
                        value={ex.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLExercises((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                          );
                        }}
                        placeholder="تفاصيل ونص التمرين المطلوب من الطالب..."
                        rows={2}
                        className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                      />

                      <input
                        type="text"
                        value={ex.solutionHint || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLExercises((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, solutionHint: val } : item))
                          );
                        }}
                        placeholder="تلميح أو إجابة نموذجية (اختياري، يظهر للطالب عند النقر)"
                        className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[11px] text-[var(--fg)]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {editingLessonId ? 'حفظ التعديلات' : 'إضافة الدرس'}
              </button>
              {editingLessonId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingLessonId(null);
                    setLTitle('');
                    setLUrl('');
                    setLExercises([]);
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          {/* Lessons List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs divide-y divide-[var(--line)]">
            {lessons
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((l) => {
                const c = courses.find((course) => course.id === l.courseId);
                return (
                  <div key={l.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-[var(--fg)] m-0">{l.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-[var(--muted)] m-0">
                          {c?.title || 'عام'} · التاريخ: {formatLongDate(l.date)}
                        </p>
                        {l.exercises && l.exercises.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] text-[10px] font-semibold">
                            <FileCheck className="w-3 h-3" />
                            {l.exercises.length} {l.exercises.length === 1 ? 'تمرين' : 'تمارين'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLessonId(l.id);
                          setLTitle(l.title);
                          setLCourseId(l.courseId);
                          setLDate(l.date);
                          setLUrl(l.url || '');
                          setLExercises(l.exercises ? [...l.exercises] : []);
                        }}
                        className="p-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
                            onDeleteLesson(l.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-xs font-semibold text-[var(--bad)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: QUIZZES BUILDER */}
      {activeTab === 'quizzes' && (
        <div className="grid gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!qTitle.trim()) return;
              const formattedQuestions = qQuestions.map((q) => ({
                q: q.q.trim(),
                options: q.opts.map((o) => o.trim()).filter(Boolean),
                answer: q.ans,
              }));

              onSaveQuiz(
                {
                  title: qTitle.trim(),
                  courseId: qCourseId,
                  minutes: qMinutes === '' ? 0 : Number(qMinutes),
                  single: qSingle,
                  questions: formattedQuestions,
                },
                editingQuizId || undefined
              );

              setEditingQuizId(null);
              setQTitle('');
              setQQuestions([{ q: '', opts: ['', '', '', ''], ans: 0 }]);
            }}
            className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
          >
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              {editingQuizId ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                عنوان الاختبار
                <input
                  type="text"
                  value={qTitle}
                  onChange={(e) => setQTitle(e.target.value)}
                  placeholder="مثال: الاختبار الفصلي الأول"
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  required
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                الدورة التدريبية
                <select
                  value={qCourseId}
                  onChange={(e) => setQCourseId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                مدة الاختبار بالدقائق (اتركه فارغاً بلا حد)
                <input
                  type="number"
                  min={1}
                  value={qMinutes}
                  onChange={(e) =>
                    setQMinutes(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--fg)] cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={qSingle}
                  onChange={(e) => setQSingle(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                السماح بمحاولة واحدة فقط للطالب
              </label>
            </div>

            {/* Questions list */}
            <div className="grid gap-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[var(--muted)] m-0">أسئلة الاختبار</h4>
                <button
                  type="button"
                  onClick={() =>
                    setQQuestions((prev) => [
                      ...prev,
                      { q: '', opts: ['', '', '', ''], ans: 0 },
                    ])
                  }
                  className="px-2.5 py-1 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                >
                  + إضافة سؤال جديد
                </button>
              </div>

              {qQuestions.map((qItem, qIdx) => (
                <div
                  key={qIdx}
                  className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/40 grid gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--accent)]">
                      السؤال {qIdx + 1}
                    </span>
                    {qQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQQuestions((prev) => prev.filter((_, i) => i !== qIdx))
                        }
                        className="text-xs text-[var(--bad)] hover:underline"
                      >
                        حذف السؤال
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={qItem.q}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQQuestions((prev) => {
                        const copy = [...prev];
                        copy[qIdx].q = val;
                        return copy;
                      });
                    }}
                    placeholder="نص السؤال..."
                    className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                    required
                  />

                  <div className="grid gap-1.5 pt-1">
                    <span className="text-[11px] text-[var(--muted)]">
                      اختر الدائرة بجانب الخيار الصحيح:
                    </span>
                    {qItem.opts.map((optText, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`ans-${qIdx}`}
                          checked={qItem.ans === oIdx}
                          onChange={() => {
                            setQQuestions((prev) => {
                              const copy = [...prev];
                              copy[qIdx].ans = oIdx;
                              return copy;
                            });
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={optText}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQQuestions((prev) => {
                              const copy = [...prev];
                              copy[qIdx].opts[oIdx] = val;
                              return copy;
                            });
                          }}
                          placeholder={`الخيار ${oIdx + 1}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {editingQuizId ? 'حفظ التعديلات' : 'نشر الاختبار'}
              </button>
              {editingQuizId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuizId(null);
                    setQTitle('');
                    setQQuestions([{ q: '', opts: ['', '', '', ''], ans: 0 }]);
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>

          {/* Quizzes List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs divide-y divide-[var(--line)]">
            {quizzes.map((q) => {
              const c = courses.find((course) => course.id === q.courseId);
              return (
                <div key={q.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--fg)] m-0">{q.title}</h4>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                      {c?.title || 'عام'} · {q.questions.length} أسئلة
                      {q.minutes ? ` · ${q.minutes} دقيقة` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuizId(q.id);
                        setQTitle(q.title);
                        setQCourseId(q.courseId || courses[0]?.id || '');
                        setQMinutes(q.minutes || '');
                        setQSingle(!!q.single);
                        setQQuestions(
                          q.questions.map((item) => ({
                            q: item.q,
                            opts: [...item.options],
                            ans: item.answer,
                          }))
                        );
                      }}
                      className="p-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
                          onDeleteQuiz(q.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-xs font-semibold text-[var(--bad)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: PROJECTS REVIEW */}
      {activeTab === 'projects' && (
        <div className="grid gap-4">
          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-[var(--muted)] flex items-center gap-2">
                الدورة:
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]"
                >
                  <option value="all">جميع الدورات</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold text-[var(--muted)] flex items-center gap-2">
                حالة المراجعة:
                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]"
                >
                  <option value="all">كل الحالات</option>
                  <option value="submitted">بانتظار المراجعة</option>
                  <option value="returned">مطلوب تعديل</option>
                  <option value="reviewed">تمت المراجعة</option>
                </select>
              </label>
            </div>

            <span className="text-xs text-[var(--muted)]">
              {filteredProjects.length} مشاريع مطابقة
            </span>
          </div>

          {/* Projects List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs divide-y divide-[var(--line)]">
            {filteredProjects.map((p) => {
              const student = students.find((s) => s.id === p.uid);
              const course = courses.find((c) => c.id === p.courseId);
              const rev = reviews[p.id];

              return (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[var(--fg)] m-0">{p.title}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                        {student?.name || 'طالب'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                      {course?.title || 'بدون دورة'} · تاريخ التسليم:{' '}
                      {formatShortDate(p.createdAt || Date.now())}
                    </p>
                    {p.text && (
                      <p className="text-xs text-[var(--fg)] opacity-80 mt-1 line-clamp-2 m-0">
                        {p.text}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                        title="فتح الرابط"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingProject(p);
                        setReviewStatus(rev?.status === 'returned' ? 'returned' : 'reviewed');
                        setReviewGrade(rev?.grade || '');
                        setReviewFeedback(rev?.feedback || '');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {rev ? 'تعديل التقييم' : 'مراجعة وتقييم'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project Review Modal */}
          {reviewingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                onClick={() => setReviewingProject(null)}
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSaveReview(reviewingProject.id, {
                    status: reviewStatus,
                    grade: reviewGrade.trim(),
                    feedback: reviewFeedback.trim(),
                    at: Date.now(),
                    by: role === 'owner' ? 'مدير المنصة' : 'المعلم المشرف',
                  });
                  setReviewingProject(null);
                }}
                className="relative z-10 w-full max-w-[500px] bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-2xl grid gap-3 animate-slide-up"
              >
                <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                  تقييم مشروع: {reviewingProject.title}
                </h3>
                <p className="text-xs text-[var(--muted)] m-0">
                  الطالب: {students.find((s) => s.id === reviewingProject.uid)?.name || 'طالب'}
                </p>

                {reviewingProject.text && (
                  <p className="p-3 rounded-xl bg-[var(--bg)] text-xs leading-relaxed text-[var(--fg)] m-0 max-h-32 overflow-y-auto">
                    {reviewingProject.text}
                  </p>
                )}

                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  نتيجة المراجعة
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  >
                    <option value="reviewed">تمت المراجعة والاعتماد</option>
                    <option value="returned">مطلوب تعديل من الطالب</option>
                  </select>
                </label>

                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  العلامة أو التقدير (اختياري)
                  <input
                    type="text"
                    value={reviewGrade}
                    onChange={(e) => setReviewGrade(e.target.value)}
                    placeholder="مثال: 19 / 20 أو ممتاز"
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  ملاحظات وتوجيهات للطالب
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={3}
                    placeholder="اكتب تعليقك الأكاديمي..."
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                  />
                </label>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    اعتماد المراجعة
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewingProject(null)}
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BLOCKS / ANNOUNCEMENTS */}
      {activeTab === 'blocks' && (
        <div className="grid gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!bTitle.trim()) return;
              onSaveBlock(
                {
                  title: bTitle.trim(),
                  text: bText.trim(),
                  linkLabel: bLabel.trim(),
                  linkUrl: bUrl.trim(),
                  courseId: bCourseId,
                },
                editingBlockId || undefined
              );
              setEditingBlockId(null);
              setBTitle('');
              setBText('');
              setBLabel('');
              setBUrl('');
            }}
            className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3"
          >
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              {editingBlockId ? 'تعديل الإعلان' : 'نشر إعلان وتنبيه جديد'}
            </h3>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              عنوان الإعلان
              <input
                type="text"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="عنوان جذاب ومختصر..."
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                required
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              نص وتفاصيل الإعلان
              <textarea
                value={bText}
                onChange={(e) => setBText(e.target.value)}
                rows={3}
                placeholder="تفاصيل التنبيه الموجه للطلاب..."
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </label>

            <div className="grid sm:grid-cols-3 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                نص الزر التفاعلي
                <input
                  type="text"
                  value={bLabel}
                  onChange={(e) => setBLabel(e.target.value)}
                  placeholder="مثال: رابط البث المباشر"
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                رابط الزر (URL)
                <input
                  type="url"
                  dir="ltr"
                  value={bUrl}
                  onChange={(e) => setBUrl(e.target.value)}
                  placeholder="https://"
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                يظهر لطلاب
                <select
                  value={bCourseId}
                  onChange={(e) => setBCourseId(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  <option value="">جميع الطلاب بالمنصة</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {editingBlockId ? 'حفظ التعديلات' : 'نشر الإعلان'}
              </button>
              {editingBlockId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingBlockId(null);
                    setBTitle('');
                    setBText('');
                    setBLabel('');
                    setBUrl('');
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>

          {/* Announcements List */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs divide-y divide-[var(--line)]">
            {blocks.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[var(--fg)] m-0">{b.title}</h4>
                  <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                    {b.text ? `${b.text.slice(0, 60)}...` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlockId(b.id);
                      setBTitle(b.title);
                      setBText(b.text || '');
                      setBLabel(b.linkLabel || '');
                      setBUrl(b.linkUrl || '');
                      setBCourseId(b.courseId || '');
                    }}
                    className="p-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                        onDeleteBlock(b.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-xs font-semibold text-[var(--bad)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: TEACHERS (OWNER ONLY) */}
      {activeTab === 'teachers' && isOwner && (
        <div className="grid gap-4">
          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-4">
            <div>
              <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                إدارة المعلمين المشرفين وتوزيع الدورات
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                عيّن الدورات التي يحق للمعلم مراجعة مشاريعها وإدارتها
              </p>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {teachers.map((t) => (
                <div key={t.id} className="py-3.5 grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--fg)]">
                      {t.name || 'معلم مشرف'}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {(t.courses || []).length} دورات معينة
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {courses.map((c) => {
                      const isAssigned = (t.courses || []).includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className="flex items-center gap-1.5 text-xs text-[var(--fg)] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              const newCourses = e.target.checked
                                ? [...(t.courses || []), c.id]
                                : (t.courses || []).filter((id) => id !== c.id);
                              onAssignTeacherCourses(t.id, newCourses);
                            }}
                            className="rounded"
                          />
                          {c.title}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SITE IDENTITY & CERTIFICATE DESIGNER (OWNER ONLY) */}
      {activeTab === 'site' && isOwner && (
        <div className="grid gap-4">
          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3">
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              هوية الموقع والشعار
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                اسم الموقع / الأكاديمية
                <input
                  type="text"
                  value={siteDraft.name}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                الوصف تحت الاسم (Tagline)
                <input
                  type="text"
                  value={siteDraft.tagline}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, tagline: e.target.value }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {siteDraft.logo ? (
                <img
                  src={siteDraft.logo}
                  alt="الشعار"
                  className="h-10 max-w-[120px] object-contain rounded border border-[var(--line)] bg-white p-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center font-bold text-xs text-[var(--accent)]">
                  شعار
                </div>
              )}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                  رفع شعار الموقع (أيقونة صغيرة)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs file:ms-2 file:px-3 file:py-1.5 file:rounded-xl file:border border-[var(--line)] file:bg-[var(--surface)] file:text-xs file:font-semibold"
                />
              </div>
              {siteDraft.logo && (
                <button
                  type="button"
                  onClick={() => setSiteDraft((prev) => ({ ...prev, logo: '' }))}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  إزالة الشعار
                </button>
              )}
            </div>

            {/* Club Picture and Welcome Banner Section */}
            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 grid gap-3 mt-2">
              <h4 className="font-bold text-xs text-[var(--fg)] flex items-center gap-2 m-0">
                <span>صورة وبانر النادي المعروضة في الصفحة الرئيسية</span>
              </h4>

              {siteDraft.clubImage && (
                <div className="relative rounded-xl overflow-hidden border border-[var(--line)] aspect-video max-h-48 bg-black/5">
                  <img
                    src={siteDraft.clubImage}
                    alt="صورة النادي"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSiteDraft((prev) => ({ ...prev, clubImage: '' }))}
                    className="absolute top-2 end-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold hover:bg-rose-600 transition-colors shadow-md"
                  >
                    إزالة الصورة
                  </button>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  رابط صورة النادي المباشر (URL)
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={siteDraft.clubImage || ''}
                    onChange={(e) =>
                      setSiteDraft((prev) => ({ ...prev, clubImage: e.target.value }))
                    }
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                  />
                </label>

                <div>
                  <label className="block text-xs font-semibold text-[var(--muted)] mb-1">
                    أو ارفع صورة من جهازك
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleClubImageUpload}
                    className="w-full text-xs file:ms-2 file:px-3 file:py-1.5 file:rounded-xl file:border border-[var(--line)] file:bg-[var(--surface)] file:text-xs file:font-semibold"
                  />
                </div>
              </div>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                معلومات ونبذة عن النادي (تعرض في واجهة الرئيسية)
                <textarea
                  rows={3}
                  value={siteDraft.clubAbout || ''}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, clubAbout: e.target.value }))
                  }
                  placeholder="اكتب نبذة ترحيبية ومعلومات عن النادي ورؤيته وأهدافه..."
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)] leading-relaxed"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                معلومات التواصل أو رابط القناة/المجتمع (Contact Info)
                <input
                  type="text"
                  placeholder="مثال: https://t.me/erwaa_club أو رقم التواصل"
                  value={siteDraft.clubContact || ''}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, clubContact: e.target.value }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                اللون الرئيسي للمنصة (Accent Color)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={siteDraft.accent}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, accent: e.target.value }))
                  }
                  className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border border-[var(--line)]"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setSiteDraft((prev) => ({ ...prev, accent: color }))
                      }
                      className="w-7 h-7 rounded-full border-2 border-white shadow-xs transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      aria-label={`اختر اللون ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                خط العناوين والشهادات
                <select
                  value={siteDraft.fontHead}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, fontHead: e.target.value }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {ARABIC_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                خط النصوص والمحتوى
                <select
                  value={siteDraft.fontBody}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({ ...prev, fontBody: e.target.value }))
                  }
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
                >
                  {ARABIC_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3">
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              النصوص وعناوين القوائم
            </h3>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              عنوان الترحيب في لوحة الطالب
              <input
                type="text"
                value={siteDraft.welcomeTitle}
                onChange={(e) =>
                  setSiteDraft((prev) => ({ ...prev, welcomeTitle: e.target.value }))
                }
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              نص الترحيب والتوجيه
              <textarea
                value={siteDraft.welcomeText}
                onChange={(e) =>
                  setSiteDraft((prev) => ({ ...prev, welcomeText: e.target.value }))
                }
                rows={2}
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </label>

            <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
              نص تذييل الصفحة (Footer)
              <textarea
                value={siteDraft.footer}
                onChange={(e) =>
                  setSiteDraft((prev) => ({ ...prev, footer: e.target.value }))
                }
                rows={2}
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)]"
              />
            </label>
          </div>

          <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-xs grid gap-3">
            <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
              مصمم الشهادات التفاعلي (Live Canvas Designer)
            </h3>
            <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
              اسحب أي عنصر على الشاشة لتغيير موضعه، أو عدّل حجمه ولونه أدناه
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                صورة خلفية مخصصة للشهادة:
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCertBgUpload}
                className="text-xs file:px-3 file:py-1.5 file:rounded-xl file:border file:border-[var(--line)] file:bg-[var(--bg)] file:text-xs"
              />
              {certBgDraft && (
                <button
                  type="button"
                  onClick={() => setCertBgDraft('')}
                  className="px-2.5 py-1 rounded-lg border border-rose-200 text-xs text-rose-600 hover:bg-rose-50"
                >
                  إزالة الخلفية
                </button>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-[var(--line)] shadow-sm bg-white touch-none">
              <canvas
                ref={certCanvasRef}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                className="w-full h-auto block cursor-grab active:cursor-grabbing"
                aria-label="معاينة حية للشهادة"
              />
            </div>

            <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--bg)]/50 grid gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  العنصر المحدد للتحكم
                  <select
                    value={selectedCertElem}
                    onChange={(e) =>
                      setSelectedCertElem(e.target.value as keyof CertLayout)
                    }
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                  >
                    {CERT_ELEMENTS.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-center gap-4 pt-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--fg)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteDraft.cert.layout[selectedCertElem]?.on}
                      onChange={(e) =>
                        setSiteDraft((prev) => {
                          const copy = JSON.parse(JSON.stringify(prev));
                          copy.cert.layout[selectedCertElem].on = e.target.checked;
                          return copy;
                        })
                      }
                      className="w-4 h-4 rounded"
                    />
                    إظهار هذا العنصر بالشهادة
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)] cursor-pointer">
                    اللون:
                    <input
                      type="color"
                      value={
                        siteDraft.cert.layout[selectedCertElem]?.color ||
                        siteDraft.accent
                      }
                      onChange={(e) =>
                        setSiteDraft((prev) => {
                          const copy = JSON.parse(JSON.stringify(prev));
                          copy.cert.layout[selectedCertElem].color = e.target.value;
                          return copy;
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer p-0.5 border border-[var(--line)]"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[var(--muted)]">
                    حجم الخط للعنصر المختار
                  </span>
                  <span className="font-mono font-bold">
                    {siteDraft.cert.layout[selectedCertElem]?.size || 40}px
                  </span>
                </div>
                <input
                  type="range"
                  min={14}
                  max={140}
                  step={2}
                  value={siteDraft.cert.layout[selectedCertElem]?.size || 40}
                  onChange={(e) =>
                    setSiteDraft((prev) => {
                      const copy = JSON.parse(JSON.stringify(prev));
                      copy.cert.layout[selectedCertElem].size = Number(e.target.value);
                      return copy;
                    })
                  }
                  className="w-full cursor-pointer accent-[var(--accent)]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  عنوان الشهادة
                  <input
                    type="text"
                    value={siteDraft.cert.title}
                    onChange={(e) =>
                      setSiteDraft((prev) => ({
                        ...prev,
                        cert: { ...prev.cert, title: e.target.value },
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                  />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  سطر التقديم (استخدم {'{site}'} لاسم الموقع)
                  <input
                    type="text"
                    value={siteDraft.cert.pre}
                    onChange={(e) =>
                      setSiteDraft((prev) => ({
                        ...prev,
                        cert: { ...prev.cert, pre: e.target.value },
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                  />
                </label>
              </div>

              <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                نص الشهادة وعبارة التقدير (استخدم {'{course}'} لاسم الدورة)
                <textarea
                  value={siteDraft.cert.body}
                  onChange={(e) =>
                    setSiteDraft((prev) => ({
                      ...prev,
                      cert: { ...prev.cert, body: e.target.value },
                    }))
                  }
                  rows={2}
                  className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  اسم الشخص الموقّع
                  <input
                    type="text"
                    value={siteDraft.cert.signer}
                    onChange={(e) =>
                      setSiteDraft((prev) => ({
                        ...prev,
                        cert: { ...prev.cert, signer: e.target.value },
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                  />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-[var(--muted)]">
                  صفة الموقّع / المنصب
                  <input
                    type="text"
                    value={siteDraft.cert.role}
                    onChange={(e) =>
                      setSiteDraft((prev) => ({
                        ...prev,
                        cert: { ...prev.cert, role: e.target.value },
                      }))
                    }
                    className="px-3.5 py-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--fg)]"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSiteDraft((prev) => ({
                      ...prev,
                      cert: {
                        ...prev.cert,
                        layout: JSON.parse(JSON.stringify(DEFAULT_SITE.cert.layout)),
                      },
                    }));
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  استعادة مواضع العناصر الافتراضية
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveSiteChanges}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-opacity hover:opacity-95"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  حفظ جميع التغييرات واعتمادها للمنصة
                </button>
                {siteSavedMsg && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الحفظ بنجاح!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      'تحذير: هل ترغب في إعادة تعيين كافة بيانات المنصة إلى النموذج التجريبي الأولي؟'
                    )
                  ) {
                    onResetAllData();
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة تعيين البيانات للوضع الافتراضي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
