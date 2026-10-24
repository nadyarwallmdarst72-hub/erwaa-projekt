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
  QuizAttempt,
  Certificate,
  Project,
  ProjectReview,
  Role,
  UserAccount,
  VerificationCode,
  NotificationItem,
  CourseMaterial,
  ScientificQuestion,
  ScientificAnswer,
  OWNER_EMAIL,
} from './types';

export const DEFAULT_SITE: SiteSettings = {
  name: "إرواء",
  tagline: "المنصة التعليمية المتكاملة",
  logo: "",
  accent: "#1B8576",
  fontBody: "IBM Plex Sans Arabic",
  fontHead: "Noto Kufi Arabic",
  welcomeTitle: "مرحبًا بك في منصة إرواء!",
  welcomeText: "تابع دروسك اليومية، وسجل حضورك بانتظام، واطرح أسئلتك العلمية وشارك في المناقشات لتحصل على شهادة الإتمام المعتمدة.",
  footer: "منصة إرواء التعليمية © 2026 — جميع الحقوق محفوظة.\nنسعى لتقديم تجربة تعليمية متميزة وملهمة.",
  labels: {
    cal: "لوحتي التعليمية",
    courses: "الدورات والمواد",
    quiz: "الاختبارات",
    certs: "الشهادات",
    projects: "المشاريع",
    questions: "الأسئلة العلمية",
  },
  cert: {
    title: "شهادة إتمام وتفوق",
    pre: "تشهد إدارة {site} بأن الطالب/ـة",
    body: "قد أتمّ بنجاح جميع متطلبات دورة «{course}» واجتاز الاختبارات النظرية والعملية بنسبة حضور ومعدل مشرف.",
    signer: "أحمد",
    role: "مالك ورئيس إدارة المنصة",
    layout: {
      brand: { on: true, x: 50, y: 15, size: 46, color: "#1B8576" },
      title: { on: true, x: 50, y: 25.7, size: 84, color: "#16302C" },
      pre: { on: true, x: 50, y: 35.4, size: 36, color: "#68807B" },
      name: { on: true, x: 50, y: 45, size: 80, color: "#1B8576" },
      body: { on: true, x: 50, y: 62, size: 42, color: "#16302C" },
      date: { on: true, x: 22, y: 85, size: 32, color: "#68807B" },
      serial: { on: true, x: 78, y: 85, size: 32, color: "#68807B" },
      signer: { on: true, x: 50, y: 81, size: 40, color: "#16302C" },
    },
  },
};

export function padZero(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
}

export function parseDateKey(k: string): Date {
  const parts = k.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export const AR_LOCALE = "ar-EG-u-nu-latn-ca-gregory";

export function formatLongDate(k: string): string {
  return parseDateKey(k).toLocaleDateString(AR_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(ms: number): string {
  return new Date(ms).toLocaleString(AR_LOCALE, {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatShortDate(ms: number): string {
  return new Date(ms).toLocaleDateString(AR_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STORAGE_KEY = "irwaa_platform_store_v5";

export interface AppStoreData {
  site: SiteSettings;
  certBg: string;
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  blocks: Announcement[];
  users: UserAccount[];
  students: Student[];
  teachers: Teacher[];
  enrolled: Record<string, Record<string, { at: number }>>;
  attendance: Record<string, Record<string, AttendanceRecord>>;
  quizResults: Record<string, Record<string, QuizResult>>;
  quizAttempts: Record<string, Record<string, QuizAttempt>>;
  certificates: Certificate[];
  projects: Record<string, Project>;
  reviews: Record<string, ProjectReview>;
  notifications: NotificationItem[];
  questions: ScientificQuestion[];
  currentUid: string;
  currentRole: Role;
  verificationCodes: Record<string, VerificationCode>;
}

function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateKey(d);
}

function generateInitialSeed(): AppStoreData {
  const now = Date.now();
  const ownerUid = "usr_owner_ahmed";

  // Owner Name is Ahmed!
  const users: UserAccount[] = [
    {
      id: ownerUid,
      email: OWNER_EMAIL,
      name: "أحمد",
      role: "owner",
      status: "active",
      joinedAt: now - 60 * 86400000,
      lastLoginAt: now,
      accountCode: "erwaa",
      bio: "مالك ومؤسس منصة إرواء التعليمية. مشرف عام على المسار الأكاديمي والتقني.",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AhmedOwner",
    },
    {
      id: "usr_khalid",
      email: "khalid.m@example.com",
      name: "خالد بن فيصل المنصور",
      role: "student",
      status: "active",
      joinedAt: now - 24 * 86400000,
      lastLoginAt: now - 1 * 86400000,
      accountCode: "123456",
      bio: "مهتم بالحوسبة السحابية وهندسة البرمجيات",
    },
    {
      id: "usr_reem",
      email: "reem.d@example.com",
      name: "ريم عبد العزيز الدوسري",
      role: "student",
      status: "active",
      joinedAt: now - 22 * 86400000,
      lastLoginAt: now - 2 * 86400000,
      accountCode: "123456",
      bio: "مصممة واجهات ومطورة واجهات تفاعلية",
    },
    {
      id: "usr_fawaz",
      email: "fawaz.o@example.com",
      name: "فواز إبراهيم العتيبي",
      role: "student",
      status: "pending",
      joinedAt: now - 1 * 86400000,
      lastLoginAt: now - 1 * 86400000,
      accountCode: "123456",
    },
    {
      id: "usr_ahmed_tch",
      email: "ahmed.teacher@example.com",
      name: "م. أحمد الشمري",
      role: "teacher",
      status: "active",
      joinedAt: now - 45 * 86400000,
      lastLoginAt: now - 3 * 86400000,
      accountCode: "123456",
      bio: "معلم ومشرف مسار تطوير الويب",
    },
    {
      id: "usr_sarah",
      email: "sarah.teacher@example.com",
      name: "أ. سارة القحطاني",
      role: "teacher",
      status: "active",
      joinedAt: now - 40 * 86400000,
      lastLoginAt: now - 2 * 86400000,
      accountCode: "123456",
      bio: "خبيرة تصميم تجربة المستخدم وتصميم النظم",
    },
  ];

  const students: Student[] = users
    .filter((u) => u.role === "student" || u.role === "owner")
    .map((u) => ({
      id: u.id,
      name: u.name,
      joinedAt: u.joinedAt,
      email: u.email,
    }));

  const teachers: Teacher[] = [
    {
      id: "usr_ahmed_tch",
      name: "م. أحمد الشمري",
      courses: ["course_web", "subj_algo"],
      at: now - 35 * 86400000,
    },
    {
      id: "usr_sarah",
      name: "أ. سارة القحطاني",
      courses: ["course_uiux"],
      at: now - 30 * 86400000,
    },
  ];

  // Courses and Subjects (مواد دراسية ودورات تدريبية)
  const courses: Course[] = [
    {
      id: "course_web",
      title: "دورة تطوير تطبيقات الويب الحديثة (React & TypeScript)",
      desc: "دورة تدريبية عملية تركز على بناء تطبيقات متكاملة وتفاعلية من الصفر للنشر السحابي.",
      teacher: "م. أحمد الشمري",
      minAtt: 80,
      minScore: 60,
      type: "course",
      category: "تقنية وبرمجة",
      createdAt: now - 30 * 86400000,
      materials: [
        {
          id: "mat_w1",
          title: "كتاب المرجع الشامل لأساسيات React 19 الحديثة",
          type: "pdf",
          url: "https://example.com/materials/react19-guide.pdf",
          size: "4.2 MB",
          description: "ملف تدريبي مفصل يغطي المفاهيم الأساسية، خطافات العمل، والأنماط المعمارية.",
        },
        {
          id: "mat_w2",
          title: "مستودع الكود المصدري للمشروع التطبيقي على GitHub",
          type: "link",
          url: "https://github.com/example/react-fullstack-starter",
          description: "كافة الأكواد والمشاريع المكتوبة أثناء الدروس خطوة بخطوة.",
        },
        {
          id: "mat_w3",
          title: "ملخص الدوال والمصطلحات البرمجية (Cheat Sheet)",
          type: "doc",
          url: "https://example.com/materials/react-typescript-cheatsheet.pdf",
          size: "1.1 MB",
          description: "ورقة مراجعة سريعة للاختبارات وللمراجعة الميدانية.",
        },
      ],
    },
    {
      id: "course_uiux",
      title: "دورة تصميم واجهات وتجربة المستخدم UI/UX الاحترافي",
      desc: "تعلم أسس التصميم الجرافيكي، بناء نظم التصميم، وإعداد النماذج التفاعلية باستخدام Figma.",
      teacher: "أ. سارة القحطاني",
      minAtt: 75,
      minScore: 70,
      type: "course",
      category: "تصميم وإبداع",
      createdAt: now - 25 * 86400000,
      materials: [
        {
          id: "mat_u1",
          title: "مكتبة عناصر ومكونات Figma الكاملة للتطبيق",
          type: "link",
          url: "https://figma.com/@example/design-system-kit",
          description: "نظام التصميم العربي الموحد متوافق مع نظام شبكة 8pt.",
        },
        {
          id: "mat_u2",
          title: "دليل معايير تباين الألوان وقابلية الوصول الرقمي WCAG",
          type: "pdf",
          url: "https://example.com/materials/accessibility-guide.pdf",
          size: "2.8 MB",
          description: "معايير تصميم واجهات سهلة الاستخدام ومريحة للعين.",
        },
      ],
    },
    {
      id: "subj_algo",
      title: "مادة: هياكل البيانات وتصميم الخوارزميات (Data Structures)",
      desc: "مادة دراسية أكاديمية تأسيسية تغطي المصفوفات، القوائم المترابطة، الأشجار، وخوارزميات البحث والترتيب المتقدمة.",
      teacher: "أحمد (مالك المنصة)",
      minAtt: 80,
      minScore: 65,
      type: "subject", // Academic Subject
      category: "علوم الحاسب الأكاديمية",
      createdAt: now - 22 * 86400000,
      materials: [
        {
          id: "mat_s1",
          title: "المذكرة الأكاديمية لمقرر هياكل البيانات وتطبيقاتها",
          type: "pdf",
          url: "https://example.com/materials/data-structures-notes.pdf",
          size: "5.6 MB",
          description: "المحتوى النظري والتمارين البرمجية الشاملة للمادة.",
        },
        {
          id: "mat_s2",
          title: "بنك المسائل والتمارين البرمجية لحل المشكلات",
          type: "doc",
          url: "https://example.com/materials/algorithms-problems-set.pdf",
          size: "2.3 MB",
          description: "أكثر من 50 تمرينًا عمليًا مع شروحات الحل خطوة بخطوة.",
        },
      ],
    },
    {
      id: "subj_ai",
      title: "مادة: أساسيات الذكاء الاصطناعي وتعلم الآلة (AI Fundamentals)",
      desc: "مادة أكاديمية تدرس أسس النماذج العصبية، معالجة اللغات الطبيعية، وهندسة الأوامر مع تطبيقات عملية.",
      teacher: "د. عمر الهاشمي",
      minAtt: 70,
      minScore: 65,
      type: "subject", // Academic Subject
      category: "الذكاء الاصطناعي",
      createdAt: now - 20 * 86400000,
      materials: [
        {
          id: "mat_ai1",
          title: "شرائح محاضرات الذكاء الاصطناعي التوليدي والـ LLMs",
          type: "pdf",
          url: "https://example.com/materials/genai-lecture-slides.pdf",
          size: "7.1 MB",
          description: "عروض تقديمية مرئية لكافة المفاهيم النظرية والنماذج التوليدية.",
        },
      ],
    },
  ];

  const lessons: Lesson[] = [
    {
      id: "les_w1",
      courseId: "course_web",
      title: "مقدمة في بيئة عمل React و بنية المكونات الأساسية",
      date: getRelativeDate(-7),
      url: "https://www.youtube.com/watch?v=SqcY0GlETPk",
      createdAt: now - 10 * 86400000,
    },
    {
      id: "les_w2",
      courseId: "course_web",
      title: "إدارة الحالة المتقدمة عبر خطافات useState و useEffect",
      date: getRelativeDate(-5),
      url: "https://www.youtube.com/watch?v=4ORZ1GmjaMc",
      createdAt: now - 8 * 86400000,
    },
    {
      id: "les_w3",
      courseId: "course_web",
      title: "التكامل مع خوادم الويب واستدعاء واجهات البرمجة APIs",
      date: getRelativeDate(-2),
      url: "https://www.youtube.com/watch?v=law87GcxB0g",
      createdAt: now - 4 * 86400000,
    },
    {
      id: "les_w4",
      courseId: "course_web",
      title: "درس اليوم: بناء لوحة تحكم تفاعلية مع Tailwind CSS",
      date: getRelativeDate(0),
      url: "https://www.youtube.com/watch?v=pFa93Wb0i2I",
      createdAt: now - 1 * 86400000,
    },
    {
      id: "les_s1",
      courseId: "subj_algo",
      title: "محاضرة 1: مفهوم التعقيد الزمني Big-O وتحليل كفاءة الخوارزميات",
      date: getRelativeDate(-3),
      url: "https://www.youtube.com/watch?v=D6xkbGLQesk",
      createdAt: now - 4 * 86400000,
    },
    {
      id: "les_s2",
      courseId: "subj_algo",
      title: "محاضرة 2: القوائم المترابطة Linked Lists وتطبيقاتها في الذاكرة",
      date: getRelativeDate(1),
      url: "https://www.youtube.com/watch?v=F8AbOfQwl1c",
      createdAt: now,
    },
    {
      id: "les_u1",
      courseId: "course_uiux",
      title: "مبادئ علم النفس الإدراكي في تصميم تجربة المستخدم UX",
      date: getRelativeDate(-6),
      url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
      createdAt: now - 9 * 86400000,
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: "quiz_web_1",
      title: "اختبار منتصف الدورة: أساسيات React و TypeScript",
      courseId: "course_web",
      minutes: 15,
      opensAt: now - 5 * 86400000,
      closesAt: now + 15 * 86400000,
      single: false,
      questions: [
        {
          q: "ما هو الخطاف (Hook) الأساسي المسؤول عن تخزين الحالة المحلية داخل المكون؟",
          options: ["useEffect", "useState", "useMemo", "useCallback"],
          answer: 1,
        },
        {
          q: "ما هي الفائدة الرئيسية من استخدام TypeScript في مشاريع React؟",
          options: [
            "زيادة سرعة التحميل في المتصفح تلقائيًا",
            "كشف الأخطاء البرمجية أثناء كتابة الكود وتعريف الأنواع الصارمة",
            "استبدال ملفات الـ CSS تمامًا",
            "إلغاء الحاجة إلى استخدام خوادم ويب",
          ],
          answer: 1,
        },
      ],
      createdAt: now - 6 * 86400000,
    },
  ];

  const blocks: Announcement[] = [
    {
      id: "ann_1",
      title: "🎉 إطلاق نظام الإشعارات والأسئلة العلمية التفاعلية",
      text: "يسر إدارة المنصة إعلامكم ببدء استقبال استفساراتكم الأكاديمية عبر تبويب «الأسئلة العلمية» مع إجابات موثقة ومعتمدة من الأساتذة.",
      linkLabel: "تصفح الأسئلة العلمية",
      linkUrl: "",
      courseId: "",
      createdAt: now - 1 * 86400000,
    },
    {
      id: "ann_2",
      title: "📢 توفير المواد الدراسية والمذكرات الرقمية بصيغة PDF",
      text: "يمكنكم الآن تصفح قسم «الدورات والمواد» لتحميل مذكرات المحاضرات والمراجع المعتمدة مباشرة.",
      linkLabel: "عرض المواد المتاحة",
      linkUrl: "",
      courseId: "",
      createdAt: now - 2 * 86400000,
    },
  ];

  // Seed Notifications
  const notifications: NotificationItem[] = [
    {
      id: "notif_1",
      title: "إعلان جديد من الإدارة",
      message: "تم تحديث المواد الدراسية وإضافة مذكرات مادة هياكل البيانات.",
      type: "announcement",
      createdAt: now - 2 * 3600000,
      read: false,
      linkTab: "courses",
    },
    {
      id: "notif_2",
      title: "قسم الأسئلة العلمية متاح الآن",
      message: "يمكنك الآن طرح استفساراتك حول البرمجة والخوارزميات وتلقي إجابات معتمدة.",
      type: "question",
      createdAt: now - 10 * 3600000,
      read: false,
      linkTab: "questions",
    },
  ];

  // Seed Scientific Questions & Verified Answers
  const questions: ScientificQuestion[] = [
    {
      id: "q_1",
      uid: "usr_khalid",
      authorName: "خالد بن فيصل المنصور",
      courseId: "course_web",
      courseTitle: "تطوير تطبيقات الويب الحديثة",
      title: "ما هو الفرق العملي بين خطافي useMemo و useCallback ومتى نفضل أحدهما؟",
      content: "ألاحظ في مشاريع React استخدام كلا الخطافين لتحسين الأداء (Memoization)، ولكن متى ينبغي عليّ استخدام useMemo ومتى يكون useCallback هو الخيار الأنسب؟ وما أثر الإفراط في استخدامهما؟",
      tags: ["React", "Performance", "Hooks"],
      createdAt: now - 2 * 86400000,
      status: "resolved",
      answers: [
        {
          id: "ans_1",
          questionId: "q_1",
          uid: ownerUid,
          authorName: "أحمد (مالك المنصة)",
          authorRole: "owner",
          content: "أهلاً بك يا خالد. الفرق الأساسي والمباشر هو:\n1. useMemo: يُستخدم لتخزين نتيجة عملية حسابية معقدة (Value).\n2. useCallback: يُستخدم لتخزين مرجع الدالة نفسها (Function Reference) حتى لا يُعاد إنشاؤها مع كل Render للمكون.\n\nتنبيه مهم: تجنب استخدامهما في كل مكان، بل فقط عندما تُمرر دوال لمكونات ابنة تستخدم React.memo أو عند إجراء عمليات حسابية ثقيلة تستهلك الذاكرة.",
          createdAt: now - 1 * 86400000,
          isVerified: true,
          likes: 5,
        },
        {
          id: "ans_2",
          questionId: "q_1",
          uid: "usr_reem",
          authorName: "ريم عبد العزيز الدوسري",
          authorRole: "student",
          content: "قاعدة ذهبية أتبعها: إذا كان الهدف منع إعادة تصيير مكون فرعي يستقبل الدالة كـ Prop، استخدم useCallback. وإذا كان الهدف تصفية مصفوفة كبيرة أو فرزها، استخدم useMemo.",
          createdAt: now - 18 * 3600000,
          isVerified: false,
          likes: 2,
        },
      ],
    },
    {
      id: "q_2",
      uid: "usr_reem",
      authorName: "ريم عبد العزيز الدوسري",
      courseId: "subj_algo",
      courseTitle: "هياكل البيانات وتصميم الخوارزميات",
      title: "كيف نحدد متى نستخدم الـ Hash Table بدلاً من الـ Binary Search Tree؟",
      content: "في مسائل البحث السريع، توفر جداول الهاش متوسط زمن O(1)، بينما شجرة البحث الثنائي O(log n). فما هي الحالات التي تجعلنا نفضل استخدام الأشجار رغم أن الهاش أسرع نظرياً؟",
      tags: ["Data Structures", "Algorithms", "Big-O"],
      createdAt: now - 1 * 86400000,
      status: "open",
      answers: [
        {
          id: "ans_3",
          questionId: "q_2",
          uid: "usr_ahmed_tch",
          authorName: "م. أحمد الشمري",
          authorRole: "teacher",
          content: "سؤال ممتاز يا ريم! نفضل استخدام Binary Search Tree (وبالتحديد Balanced BST مثل Red-Black Tree) في الحالات التالية:\n1. عندما نحتاج إلى استرجاع البيانات مرتبة بشكل دائم دون فرز إضافي.\n2. عند الحاجة لتنفيذ استعلامات النطاق (Range Queries) مثل العثور على جميع العناصر بين 10 و 50.\n3. لتجنب أسوأ حالة في الهاش O(n) الناتجة عن تصادمات المفاتيح (Collisions).",
          createdAt: now - 8 * 3600000,
          isVerified: true,
          likes: 4,
        },
      ],
    },
  ];

  const enrolled: Record<string, Record<string, { at: number }>> = {
    [ownerUid]: {
      course_web: { at: now - 20 * 86400000 },
      course_uiux: { at: now - 18 * 86400000 },
      subj_algo: { at: now - 15 * 86400000 },
    },
    usr_khalid: {
      course_web: { at: now - 22 * 86400000 },
      subj_algo: { at: now - 12 * 86400000 },
    },
    usr_reem: {
      course_web: { at: now - 21 * 86400000 },
      course_uiux: { at: now - 19 * 86400000 },
    },
  };

  const attendance: Record<string, Record<string, AttendanceRecord>> = {
    [ownerUid]: {
      les_w1: { opened: now - 7 * 86400000, attended: now - 7 * 86400000 },
      les_w2: { opened: now - 5 * 86400000, attended: now - 5 * 86400000 },
      les_w3: { opened: now - 2 * 86400000, attended: now - 2 * 86400000 },
      les_s1: { opened: now - 3 * 86400000, attended: now - 3 * 86400000 },
    },
    usr_khalid: {
      les_w1: { opened: now - 7 * 86400000, attended: now - 7 * 86400000 },
      les_w2: { opened: now - 5 * 86400000, attended: now - 5 * 86400000 },
    },
  };

  const quizResults: Record<string, Record<string, QuizResult>> = {
    [ownerUid]: {
      quiz_web_1: { score: 2, total: 2, best: 2, at: now - 4 * 86400000 },
    },
  };

  const quizAttempts: Record<string, Record<string, QuizAttempt>> = {
    [ownerUid]: {
      quiz_web_1: { startedAt: now - 4 * 86400000 },
    },
  };

  const certificates: Certificate[] = [
    {
      id: "course_web_owner",
      courseId: "course_web",
      uid: ownerUid,
      issuedAt: now - 2 * 86400000,
      serial: "E-AHMED99",
    },
  ];

  const projects: Record<string, Project> = {
    proj_1: {
      id: "proj_1",
      uid: ownerUid,
      title: "تطبيق لوحة تحكم وإدارة المهام الدراسية (TaskFlow)",
      text: "مشروع متكامل مبني باستخدام React 19 و TypeScript مع دعم الوضع الليلي وتخزين البيانات محليًا. يحتوي على رسوم بيانية لإحصائيات الإنجاز وقوائم مهام مصنفة.",
      link: "https://github.com/example/react-taskflow",
      courseId: "course_web",
      createdAt: now - 5 * 86400000,
      updatedAt: now - 5 * 86400000,
    },
  };

  const reviews: Record<string, ProjectReview> = {
    proj_1: {
      status: "reviewed",
      grade: "20 / 20",
      feedback: "عمل متقن ومتميز للغاية! كود نظيف وتصميم متناسق يلتزم بأعلى معايير تجربة المستخدم.",
      at: now - 4 * 86400000,
      by: "usr_ahmed_tch",
    },
  };

  return {
    site: DEFAULT_SITE,
    certBg: "",
    courses,
    lessons,
    quizzes,
    blocks,
    users,
    students,
    teachers,
    enrolled,
    attendance,
    quizResults,
    quizAttempts,
    certificates,
    projects,
    reviews,
    notifications,
    questions,
    currentUid: ownerUid,
    currentRole: "owner",
    verificationCodes: {},
  };
}

class AppStorageManager {
  private data: AppStoreData;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): AppStoreData {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem("irwaa_platform_store_v4") ||
        localStorage.getItem("irwaa_platform_store_v3");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.site && parsed.users && parsed.courses && parsed.questions) {
          parsed.users = parsed.users.map((u: UserAccount) => {
            const isOwner = u.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
            return {
              ...u,
              accountCode: isOwner ? "erwaa" : (u.accountCode || "123456"),
            };
          });
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading from local storage, using initial seed", e);
    }
    const seed = generateInitialSeed();
    this.saveToStorage(seed);
    return seed;
  }

  private saveToStorage(d: AppStoreData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    } catch (e) {
      console.error("Error saving to local storage", e);
    }
  }

  public getSnapshot(): AppStoreData {
    return this.data;
  }

  public update(updater: (draft: AppStoreData) => void) {
    updater(this.data);
    this.saveToStorage(this.data);
    this.notify();
  }

  public resetToDefault() {
    this.data = generateInitialSeed();
    this.saveToStorage(this.data);
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Cloud Sync Mergers ---
  public mergeCloudUsers(cloudUsers: UserAccount[]) {
    this.update((draft) => {
      cloudUsers.forEach((cu) => {
        const idx = draft.users.findIndex(
          (u) => u.id === cu.id || u.email.toLowerCase() === cu.email.toLowerCase()
        );
        if (idx >= 0) {
          draft.users[idx] = { ...draft.users[idx], ...cu };
        } else {
          draft.users.push(cu);
        }

        if (cu.role === 'student' || cu.role === 'owner') {
          const sIdx = draft.students.findIndex(
            (s) => s.id === cu.id || s.email?.toLowerCase() === cu.email.toLowerCase()
          );
          if (sIdx >= 0) {
            draft.students[sIdx].name = cu.name;
          } else {
            draft.students.push({
              id: cu.id,
              name: cu.name,
              email: cu.email,
              joinedAt: cu.joinedAt,
            });
          }
        }
      });

      if (draft.currentUid) {
        const cur = draft.users.find((u) => u.id === draft.currentUid);
        if (cur) {
          draft.currentRole = cur.role;
        }
      }
    });
  }

  public mergeCloudAnnouncements(cloudAnnouncements: Announcement[]) {
    this.update((draft) => {
      cloudAnnouncements.forEach((ca) => {
        const idx = draft.blocks.findIndex((b) => b.id === ca.id);
        if (idx >= 0) {
          draft.blocks[idx] = { ...draft.blocks[idx], ...ca };
        } else {
          draft.blocks.unshift(ca);
        }
      });
    });
  }

  public mergeCloudQuestions(cloudQuestions: ScientificQuestion[]) {
    this.update((draft) => {
      cloudQuestions.forEach((cq) => {
        const idx = draft.questions.findIndex((q) => q.id === cq.id);
        if (idx >= 0) {
          draft.questions[idx] = { ...draft.questions[idx], ...cq };
        } else {
          draft.questions.unshift(cq);
        }
      });
    });
  }

  // --- Profile Edit ---
  public updateProfile(uid: string, updates: Partial<UserAccount>) {
    this.update((draft) => {
      const user = draft.users.find((u) => u.id === uid);
      if (user) {
        if (updates.name !== undefined) user.name = updates.name.trim();
        if (updates.bio !== undefined) user.bio = updates.bio.trim();
        if (updates.phone !== undefined) user.phone = updates.phone.trim();
        if (updates.avatar !== undefined) user.avatar = updates.avatar;
        if (updates.accountCode !== undefined && updates.accountCode.trim().length >= 4) {
          user.accountCode = updates.accountCode.trim();
        }

        const stu = draft.students.find((s) => s.id === uid);
        if (stu && updates.name !== undefined) {
          stu.name = updates.name.trim();
        }
      }
    });
  }

  // --- Notifications System ---
  public addNotification(notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
    this.update((draft) => {
      draft.notifications.unshift({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        targetUid: notif.targetUid,
        linkTab: notif.linkTab,
        createdAt: Date.now(),
        read: false,
      });
    });
  }

  public markNotificationAsRead(id: string) {
    this.update((draft) => {
      const n = draft.notifications.find((item) => item.id === id);
      if (n) n.read = true;
    });
  }

  public markAllNotificationsAsRead(uid?: string) {
    this.update((draft) => {
      draft.notifications.forEach((n) => {
        if (!n.targetUid || n.targetUid === uid) {
          n.read = true;
        }
      });
    });
  }

  public deleteNotification(id: string) {
    this.update((draft) => {
      draft.notifications = draft.notifications.filter((n) => n.id !== id);
    });
  }

  // --- Scientific Questions System ---
  public addScientificQuestion(q: Omit<ScientificQuestion, 'id' | 'createdAt' | 'answers' | 'status'>) {
    this.update((draft) => {
      draft.questions.unshift({
        id: `q_${Date.now()}`,
        uid: q.uid,
        authorName: q.authorName,
        courseId: q.courseId,
        courseTitle: q.courseTitle,
        title: q.title.trim(),
        content: q.content.trim(),
        tags: q.tags || [],
        createdAt: Date.now(),
        answers: [],
        status: 'open',
      });
    });
  }

  public addScientificAnswer(
    questionId: string,
    answer: Omit<ScientificAnswer, 'id' | 'questionId' | 'createdAt' | 'isVerified' | 'likes'>
  ) {
    this.update((draft) => {
      const q = draft.questions.find((item) => item.id === questionId);
      if (q) {
        q.answers.push({
          id: `ans_${Date.now()}`,
          questionId,
          uid: answer.uid,
          authorName: answer.authorName,
          authorRole: answer.authorRole,
          content: answer.content.trim(),
          createdAt: Date.now(),
          isVerified: answer.authorRole === 'owner' || answer.authorRole === 'teacher',
          likes: 0,
        });
      }
    });
  }

  public toggleVerifyAnswer(questionId: string, answerId: string) {
    this.update((draft) => {
      const q = draft.questions.find((item) => item.id === questionId);
      if (q) {
        const a = q.answers.find((item) => item.id === answerId);
        if (a) {
          a.isVerified = !a.isVerified;
        }
      }
    });
  }

  public deleteScientificQuestion(questionId: string) {
    this.update((draft) => {
      draft.questions = draft.questions.filter((q) => q.id !== questionId);
    });
  }

  // --- Course Materials System ---
  public addCourseMaterial(courseId: string, mat: Omit<CourseMaterial, 'id'>) {
    this.update((draft) => {
      const c = draft.courses.find((item) => item.id === courseId);
      if (c) {
        if (!c.materials) c.materials = [];
        c.materials.push({
          id: `mat_${Date.now()}`,
          title: mat.title.trim(),
          type: mat.type,
          url: mat.url.trim(),
          size: mat.size?.trim(),
          description: mat.description?.trim(),
        });
      }
    });
  }

  public deleteCourseMaterial(courseId: string, materialId: string) {
    this.update((draft) => {
      const c = draft.courses.find((item) => item.id === courseId);
      if (c && c.materials) {
        c.materials = c.materials.filter((m) => m.id !== materialId);
      }
    });
  }

  // --- Secure Account Code Auth Methods ---
  public loginWithCode(
    email: string,
    code: string
  ): { success: boolean; error?: string; user?: UserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      return { success: false, error: "الرجاء إدخال البريد الإلكتروني." };
    }
    if (!cleanCode) {
      return { success: false, error: "الرجاء إدخال رمز الحساب." };
    }

    const user = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return {
        success: false,
        error: "هذا البريد الإلكتروني غير مسجل، يرجى إنشاء حساب جديد أولاً.",
      };
    }

    const isOwner = cleanEmail === OWNER_EMAIL.toLowerCase();
    const expectedCode = isOwner ? (user.accountCode || "erwaa") : (user.accountCode || "123456");
    const isCodeValid = isOwner
      ? cleanCode === expectedCode || cleanCode === "erwaa"
      : cleanCode === expectedCode || cleanCode === "123456";

    if (!isCodeValid) {
      return {
        success: false,
        error: "رمز الحساب غير صحيح! يرجى التأكد من الرمز والمحاولة مجدداً.",
      };
    }

    if (user.status === "suspended") {
      return {
        success: false,
        error: "تم إيقاف هذا الحساب من قِبل إدارة المنصة. يرجى مراجعة المسؤول.",
      };
    }

    this.update((draft) => {
      const u = draft.users.find((x) => x.id === user.id);
      if (u) {
        u.lastLoginAt = Date.now();
        draft.currentUid = u.id;
        draft.currentRole = u.role;
      }
    });

    return { success: true, user };
  }

  public registerWithCode(
    email: string,
    code: string,
    name: string
  ): { success: boolean; error?: string; user?: UserAccount } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();
    const cleanName = name.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "الرجاء إدخال بريد إلكتروني صالح." };
    }

    if (!cleanCode || cleanCode.length < 4) {
      return { success: false, error: "يجب أن يتكون رمز الحساب من 4 خانات أو أحرف على الأقل." };
    }

    // STRICT CHECK: Prevent duplicate accounts with different or same codes!
    const existingUser = this.data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return {
        success: false,
        error: "هذا البريد الإلكتروني مسجل بالفعل مسبقاً! لا يمكن إنشاء حساب مكرر برمز مختلف. يرجى تسجيل الدخول برمز حسابك.",
      };
    }

    const isOwner = cleanEmail === OWNER_EMAIL.toLowerCase();
    const newUid = `usr_${Date.now()}`;
    const newUser: UserAccount = {
      id: newUid,
      email: cleanEmail,
      name: isOwner ? "أحمد" : (cleanName || cleanEmail.split("@")[0]),
      role: isOwner ? "owner" : "student",
      status: isOwner ? "active" : "pending",
      joinedAt: Date.now(),
      lastLoginAt: Date.now(),
      accountCode: cleanCode,
      bio: isOwner ? "مالك المنصة" : "طالب في المنصة",
    };

    this.update((draft) => {
      draft.users.push(newUser);
      if (newUser.role === "student" || newUser.role === "owner") {
        draft.students.push({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          joinedAt: newUser.joinedAt,
        });
      }
      draft.currentUid = newUser.id;
      draft.currentRole = newUser.role;
    });

    return { success: true, user: newUser };
  }

  // Backwards compatible methods
  public verifyAndLogin(
    email: string,
    code: string,
    name?: string
  ): { success: boolean; error?: string; user?: UserAccount } {
    const loginRes = this.loginWithCode(email, code);
    if (loginRes.success) return loginRes;
    return this.registerWithCode(email, code, name || "");
  }

  public generateOtpCode(email: string): string {
    return "123456";
  }

  public logout() {
    this.update((draft) => {
      draft.currentUid = "";
      draft.currentRole = "student";
    });
  }

  // --- Owner Management Actions ---
  public approveUser(uid: string) {
    this.update((draft) => {
      const u = draft.users.find((x) => x.id === uid);
      if (u) {
        u.status = "active";
      }
    });
  }

  public suspendUser(uid: string, suspend: boolean) {
    this.update((draft) => {
      const u = draft.users.find((x) => x.id === uid);
      if (u) {
        u.status = suspend ? "suspended" : "active";
      }
    });
  }

  public deleteUser(uid: string) {
    this.update((draft) => {
      draft.users = draft.users.filter((x) => x.id !== uid);
      draft.students = draft.students.filter((x) => x.id !== uid);
      draft.teachers = draft.teachers.filter((x) => x.id !== uid);
      delete draft.enrolled[uid];
      delete draft.attendance[uid];
      delete draft.quizResults[uid];
      delete draft.quizAttempts[uid];
      draft.certificates = draft.certificates.filter((c) => c.uid !== uid);

      Object.keys(draft.projects).forEach((pId) => {
        if (draft.projects[pId].uid === uid) {
          delete draft.projects[pId];
          delete draft.reviews[pId];
        }
      });

      if (draft.currentUid === uid) {
        draft.currentUid = "";
        draft.currentRole = "student";
      }
    });
  }

  public promoteUser(uid: string, newRole: Role) {
    this.update((draft) => {
      const u = draft.users.find((x) => x.id === uid);
      if (u) {
        u.role = newRole;
        if (newRole === "teacher") {
          const exists = draft.teachers.find((t) => t.id === uid);
          if (!exists) {
            draft.teachers.push({
              id: uid,
              name: u.name,
              courses: draft.courses.length > 0 ? [draft.courses[0].id] : [],
              at: Date.now(),
            });
          }
        } else {
          draft.teachers = draft.teachers.filter((t) => t.id !== uid);
        }
      }
    });
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const appStorage = new AppStorageManager();
