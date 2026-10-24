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
} from './types';

export const DEFAULT_SITE: SiteSettings = {
  name: "إرواء",
  tagline: "المنصة التعليمية المتكاملة",
  logo: "",
  accent: "#1B8576",
  fontBody: "IBM Plex Sans Arabic",
  fontHead: "Noto Kufi Arabic",
  welcomeTitle: "مرحبًا بك في منصة إرواء!",
  welcomeText: "تابع دروسك اليومية، وسجل حضورك بانتظام، وأكمل مشاريعك واختباراتك لتحصل على شهادة الإتمام المعتمدة.",
  footer: "منصة إرواء التعليمية © 2026 — جميع الحقوق محفوظة.\nنسعى لتقديم تجربة تعليمية متميزة وملهمة.",
  labels: {
    cal: "لوحتي التعليمية",
    courses: "الدورات",
    quiz: "الاختبارات",
    certs: "الشهادات",
    projects: "المشاريع",
  },
  cert: {
    title: "شهادة إتمام وتفوق",
    pre: "تشهد إدارة {site} بأن الطالب/ـة",
    body: "قد أتمّ بنجاح جميع متطلبات دورة «{course}» واجتاز الاختبارات النظرية والعملية بنسبة حضور ومعدل مشرف.",
    signer: "أ.د. عبد الرحمن السعدي",
    role: "رئيس الهيئة الأكاديمية",
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

const STORAGE_KEY = "irwaa_platform_store_v1";

export interface AppStoreData {
  site: SiteSettings;
  certBg: string;
  courses: Course[];
  lessons: Lesson[];
  quizzes: Quiz[];
  blocks: Announcement[];
  students: Student[];
  teachers: Teacher[];
  enrolled: Record<string, Record<string, { at: number }>>; // uid -> courseId -> {at}
  attendance: Record<string, Record<string, AttendanceRecord>>; // uid -> lessonId -> AttendanceRecord
  quizResults: Record<string, Record<string, QuizResult>>; // uid -> quizId -> QuizResult
  quizAttempts: Record<string, Record<string, QuizAttempt>>; // uid -> quizId -> QuizAttempt
  certificates: Certificate[];
  projects: Record<string, Project>; // projId -> Project
  reviews: Record<string, ProjectReview>; // projId -> ProjectReview
  currentUid: string;
  currentRole: Role;
}

function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateKey(d);
}

function generateInitialSeed(): AppStoreData {
  const now = Date.now();
  const currentUid = "stu_nadia_01";

  const courses: Course[] = [
    {
      id: "course_web",
      title: "تطوير تطبيقات الويب الحديثة (React & TypeScript)",
      desc: "دورة شاملة في بناء تطبيقات الويب التفاعلية الحديثة من الصفر حتى النشر المتقدم.",
      teacher: "م. أحمد الشمري",
      minAtt: 80,
      minScore: 60,
      createdAt: now - 30 * 86400000,
    },
    {
      id: "course_uiux",
      title: "تصميم واجهات وتجربة المستخدم UI/UX الاحترافي",
      desc: "تعلم أسس التصميم الجرافيكي، بناء نظم التصميم، وإعداد النماذج التفاعلية باستخدام Figma.",
      teacher: "أ. سارة القحطاني",
      minAtt: 75,
      minScore: 70,
      createdAt: now - 25 * 86400000,
    },
    {
      id: "course_ai",
      title: "أساسيات الذكاء الاصطناعي التوليدي وهندسة الأوامر",
      desc: "اكتشف إمكانيات النماذج التوليدية الحديثة وكيفية دمجها في المشاريع البرمجية.",
      teacher: "د. عمر الهاشمي",
      minAtt: 70,
      minScore: 65,
      createdAt: now - 20 * 86400000,
    },
  ];

  const lessons: Lesson[] = [
    // Web Course Lessons
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
      id: "les_w5",
      courseId: "course_web",
      title: "قواعد الأمان وتوثيق المستخدمين وطرق الحماية",
      date: getRelativeDate(3),
      url: "https://www.youtube.com/watch?v=k3Vfj-e1Ma4",
      createdAt: now,
    },
    {
      id: "les_w6",
      courseId: "course_web",
      title: "النشر المستمر وإعداد بيئة الإنتاج على السحابة",
      date: getRelativeDate(7),
      url: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
      createdAt: now,
    },

    // UI/UX Course Lessons
    {
      id: "les_u1",
      courseId: "course_uiux",
      title: "مبادئ علم النفس الإدراكي في تصميم تجربة المستخدم UX",
      date: getRelativeDate(-6),
      url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
      createdAt: now - 9 * 86400000,
    },
    {
      id: "les_u2",
      courseId: "course_uiux",
      title: "نظرية الألوان والخطوط العربية في تصميم الهوية الرقمية",
      date: getRelativeDate(-3),
      url: "https://www.youtube.com/watch?v=Zfomz7i6P8E",
      createdAt: now - 5 * 86400000,
    },
    {
      id: "les_u3",
      courseId: "course_uiux",
      title: "درس اليوم: بناء نظام تصميم متكامل Design System في Figma",
      date: getRelativeDate(0),
      url: "https://www.youtube.com/watch?v=jwMp_u7uQ9g",
      createdAt: now - 1 * 86400000,
    },
    {
      id: "les_u4",
      courseId: "course_uiux",
      title: "اختبار سهولة الاستخدام وتطوير النماذج التفاعلية",
      date: getRelativeDate(4),
      url: "https://www.youtube.com/watch?v=ft30zcMlFao",
      createdAt: now,
    },

    // AI Course Lessons
    {
      id: "les_a1",
      courseId: "course_ai",
      title: "مدخل إلى النماذج اللغوية الكبيرة LLMs ومفاهيم عملها",
      date: getRelativeDate(-4),
      url: "https://www.youtube.com/watch?v=zjkBMFhNj_g",
      createdAt: now - 6 * 86400000,
    },
    {
      id: "les_a2",
      courseId: "course_ai",
      title: "أفضل ممارسات هندسة الأوامر Prompt Engineering المتقدمة",
      date: getRelativeDate(-1),
      url: "https://www.youtube.com/watch?v=_ZvnD93TgJ8",
      createdAt: now - 2 * 86400000,
    },
    {
      id: "les_a3",
      courseId: "course_ai",
      title: "بناء تطبيقات مدعومة بالذكاء الاصطناعي مع Gemini API",
      date: getRelativeDate(5),
      url: "https://www.youtube.com/watch?v=b093qa3450",
      createdAt: now,
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
          q: "متى يتم تنفيذ كود الدالة الممررة لـ useEffect بدون مصفوفة تبعيات [ ]؟",
          options: [
            "عند أول تحميل للمكون فقط",
            "بعد كل عملية تصيير (Render) للمكون",
            "عند تفكيك المكون فقط",
            "فقط عند حدوث خطأ",
          ],
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
        {
          q: "ما هي الطريقة الصحيحة لتمرير خاصية (Prop) من المكون الأب إلى المكون الابن؟",
          options: [
            "<Child propName={value} />",
            "Child.setProp('propName', value)",
            "window.propName = value",
            "<Child :propName='value'>",
          ],
          answer: 0,
        },
      ],
      createdAt: now - 6 * 86400000,
    },
    {
      id: "quiz_uiux_1",
      title: "اختبار قواعد تجربة المستخدم وتناسق الألوان",
      courseId: "course_uiux",
      minutes: 10,
      opensAt: now - 3 * 86400000,
      closesAt: now + 10 * 86400000,
      single: false,
      questions: [
        {
          q: "ماذا يقصد بقاعدة التباين (Contrast Ratio) بين النص ولون الخلفية وفق معايير WCAG؟",
          options: [
            "ضمان وضوح وقراءة النص لجميع المستخدمين بما فيهم ضعاف البصر",
            "استخدام ألوان براقة فقط لجذب الانتباه",
            "تطابق درجات التشبع بين العناصر",
            "استخدام خطوط مائلة حصرًا",
          ],
          answer: 0,
        },
        {
          q: "ما هو الغرض من إعداد Wireframe منخفض الدقة (Low-Fidelity) في بداية المشروع؟",
          options: [
            "اختيار الألوان النهائية للشعار",
            "التركيز على هيكلية المحتوى وتدفق الصفحات قبل التفاصيل البصرية",
            "كتابة كود الـ JavaScript مباشرة",
            "طباعة الملصقات الإعلانية",
          ],
          answer: 1,
        },
        {
          q: "ما هو مبدأ Fitts's Law في تصميم الواجهات التفاعلية؟",
          options: [
            "كلما كان الزر أكبر وأقرب لمؤشر الفأرة، كان النقر عليه أسرع وأسهل",
            "الواجهات الداكنة تستهلك طاقة أقل دائمًا",
            "يجب ألا تتجاوز ألوان الصفحة لونين",
            "حجم الخط يجب أن يكون ثابتًا في كل الشاشات",
          ],
          answer: 0,
        },
      ],
      createdAt: now - 4 * 86400000,
    },
  ];

  const blocks: Announcement[] = [
    {
      id: "ann_1",
      title: "🎉 فتح باب التسليم للمشاريع النهائية للفصل الدراسي الحالي",
      text: "أعزاءنا الطلاب، يرجى تسليم مشاريعكم عبر تبويب «المشاريع» قبل موعد الاختبار الختامي ليتمكن المشرفون من مراجعتها واعتماد درجاتكم.",
      linkLabel: "انتقل لتبويب المشاريع",
      linkUrl: "",
      courseId: "",
      createdAt: now - 2 * 86400000,
    },
    {
      id: "ann_2",
      title: "📌 ورشة عمل تفاعلية مباشرة: كيفية بناء ملف أعمال Portfolio متميز",
      text: "تقام الورشة يوم الخميس القادم عبر البث المباشر مع استعراض أمثلة حية لأفضل الممارسات المهنية.",
      linkLabel: "رابط جلسة البث",
      linkUrl: "https://meet.google.com",
      courseId: "course_web",
      createdAt: now - 4 * 86400000,
    },
  ];

  const students: Student[] = [
    {
      id: "stu_nadia_01",
      name: "نادية الرويلي",
      joinedAt: now - 28 * 86400000,
      email: "nadia.r@example.com",
    },
    {
      id: "stu_khalid_02",
      name: "خالد بن فيصل المنصور",
      joinedAt: now - 24 * 86400000,
      email: "khalid.m@example.com",
    },
    {
      id: "stu_reem_03",
      name: "ريم عبد العزيز الدوسري",
      joinedAt: now - 22 * 86400000,
      email: "reem.d@example.com",
    },
    {
      id: "stu_fawaz_04",
      name: "فواز إبراهيم العتيبي",
      joinedAt: now - 18 * 86400000,
      email: "fawaz.o@example.com",
    },
  ];

  const teachers: Teacher[] = [
    {
      id: "tch_ahmed",
      name: "م. أحمد الشمري",
      courses: ["course_web"],
      at: now - 35 * 86400000,
    },
    {
      id: "tch_sarah",
      name: "أ. سارة القحطاني",
      courses: ["course_uiux"],
      at: now - 30 * 86400000,
    },
    {
      id: "tch_omar",
      name: "د. عمر الهاشمي",
      courses: ["course_ai"],
      at: now - 25 * 86400000,
    },
  ];

  // Enrollments
  const enrolled: Record<string, Record<string, { at: number }>> = {
    stu_nadia_01: {
      course_web: { at: now - 20 * 86400000 },
      course_uiux: { at: now - 18 * 86400000 },
    },
    stu_khalid_02: {
      course_web: { at: now - 22 * 86400000 },
    },
    stu_reem_03: {
      course_web: { at: now - 21 * 86400000 },
      course_uiux: { at: now - 19 * 86400000 },
      course_ai: { at: now - 15 * 86400000 },
    },
    stu_fawaz_04: {
      course_ai: { at: now - 16 * 86400000 },
    },
  };

  // Nadia's attendance
  const attendance: Record<string, Record<string, AttendanceRecord>> = {
    stu_nadia_01: {
      les_w1: { opened: now - 7 * 86400000, attended: now - 7 * 86400000 },
      les_w2: { opened: now - 5 * 86400000, attended: now - 5 * 86400000 },
      les_w3: { opened: now - 2 * 86400000, attended: now - 2 * 86400000 },
      les_u1: { opened: now - 6 * 86400000, attended: now - 6 * 86400000 },
      les_u2: { opened: now - 3 * 86400000, attended: now - 3 * 86400000 },
    },
    stu_khalid_02: {
      les_w1: { opened: now - 7 * 86400000, attended: now - 7 * 86400000 },
      les_w2: { opened: now - 5 * 86400000, attended: now - 5 * 86400000 },
    },
    stu_reem_03: {
      les_w1: { opened: now - 7 * 86400000, attended: now - 7 * 86400000 },
      les_w2: { opened: now - 5 * 86400000, attended: now - 5 * 86400000 },
      les_w3: { opened: now - 2 * 86400000, attended: now - 2 * 86400000 },
      les_u1: { opened: now - 6 * 86400000, attended: now - 6 * 86400000 },
      les_u2: { opened: now - 3 * 86400000, attended: now - 3 * 86400000 },
      les_a1: { opened: now - 4 * 86400000, attended: now - 4 * 86400000 },
      les_a2: { opened: now - 1 * 86400000, attended: now - 1 * 86400000 },
    },
  };

  const quizResults: Record<string, Record<string, QuizResult>> = {
    stu_nadia_01: {
      quiz_web_1: { score: 4, total: 4, best: 4, at: now - 4 * 86400000 },
      quiz_uiux_1: { score: 3, total: 3, best: 3, at: now - 2 * 86400000 },
    },
    stu_reem_03: {
      quiz_web_1: { score: 3, total: 4, best: 3, at: now - 3 * 86400000 },
    },
  };

  const quizAttempts: Record<string, Record<string, QuizAttempt>> = {
    stu_nadia_01: {
      quiz_web_1: { startedAt: now - 4 * 86400000 },
      quiz_uiux_1: { startedAt: now - 2 * 86400000 },
    },
  };

  const certificates: Certificate[] = [
    {
      id: "course_web_stu_reem_03",
      courseId: "course_web",
      uid: "stu_reem_03",
      issuedAt: now - 2 * 86400000,
      serial: "E9812A",
    },
  ];

  const projects: Record<string, Project> = {
    proj_1: {
      id: "proj_1",
      uid: "stu_nadia_01",
      title: "تطبيق لوحة تحكم وإدارة المهام الدراسية (TaskFlow)",
      text: "مشروع متكامل مبني باستخدام React 19 و TypeScript مع دعم الوضع الليلي وتخزين البيانات محليًا. يحتوي على رسوم بيانية لإحصائيات الإنجاز وقوائم مهام مصنفة.",
      link: "https://github.com/example/react-taskflow",
      courseId: "course_web",
      createdAt: now - 5 * 86400000,
      updatedAt: now - 5 * 86400000,
    },
    proj_2: {
      id: "proj_2",
      uid: "stu_nadia_01",
      title: "تصميم نموذج تطبيقي لحجز المواعيد الطبية الذكية",
      text: "ملف تصميم Figma كامل يحتوي على أكثر من 20 شاشة مع تدفقات المستخدم ونظام الألوان المتناسق ومكتبة عناصر UI متكاملة.",
      link: "https://figma.com/@example/medical-app",
      courseId: "course_uiux",
      createdAt: now - 3 * 86400000,
      updatedAt: now - 3 * 86400000,
    },
    proj_3: {
      id: "proj_3",
      uid: "stu_khalid_02",
      title: "متجر إلكتروني مصغر للكتب التعليمية",
      text: "تم إعداد واجهة المتجر مع سلة المشتريات وتصفية التصنيفات باللغة العربية.",
      link: "https://github.com/example/arabic-bookstore",
      courseId: "course_web",
      createdAt: now - 2 * 86400000,
      updatedAt: now - 2 * 86400000,
    },
  };

  const reviews: Record<string, ProjectReview> = {
    proj_1: {
      status: "reviewed",
      grade: "20 / 20",
      feedback: "عمل متقن ومتميز للغاية يا نادية! كود نظيف وتصميم متناسق يلتزم بأعلى معايير تجربة المستخدم. أحسنتِ.",
      at: now - 4 * 86400000,
      by: "tch_ahmed",
    },
    proj_2: {
      status: "reviewed",
      grade: "19 / 20",
      feedback: "جهد رائع ونظام تصميم أنيق. يُفضل فقط زيادة التباين في شاشة تأكيد الحجز للمرضى كبار السن.",
      at: now - 2 * 86400000,
      by: "tch_sarah",
    },
  };

  return {
    site: DEFAULT_SITE,
    certBg: "",
    courses,
    lessons,
    quizzes,
    blocks,
    students,
    teachers,
    enrolled,
    attendance,
    quizResults,
    quizAttempts,
    certificates,
    projects,
    reviews,
    currentUid,
    currentRole: "student", // default view for new visitors
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
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.site && parsed.courses) {
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

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const appStorage = new AppStorageManager();
