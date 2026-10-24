/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import {
  appStorage,
  formatDateKey,
} from './storage';
import {
  SiteSettings,
  Course,
  Lesson,
  Quiz,
  Announcement,
  Project,
  ProjectReview,
  Role,
  UserAccount,
  CourseMaterial,
  ScientificQuestion,
  OWNER_EMAIL,
} from './types';
import {
  initCloudSync,
  saveUserToCloud,
  updateUserStatusInCloud,
  updateUserRoleInCloud,
  updateUserProfileInCloud,
  deleteUserFromCloud,
  saveAnnouncementToCloud,
  deleteAnnouncementFromCloud,
  saveQuestionToCloud,
  deleteQuestionFromCloud,
} from './services/cloudSync';
import { Header } from './components/Header';
import { TabsNav, MainTabKey } from './components/TabsNav';
import { CalendarView } from './components/CalendarView';
import { CoursesView } from './components/CoursesView';
import { ScientificQuestionsView } from './components/ScientificQuestionsView';
import { QuizzesView } from './components/QuizzesView';
import { CertificatesView } from './components/CertificatesView';
import { ProjectsView } from './components/ProjectsView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { NotificationsModal } from './components/NotificationsModal';
import { EditProfileModal } from './components/EditProfileModal';
import { Clock, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  const store = useSyncExternalStore(
    (onStoreChange) => appStorage.subscribe(onStoreChange),
    () => appStorage.getSnapshot()
  );

  const [currentTab, setCurrentTab] = useState<MainTabKey>('cal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'error'>('syncing');

  useEffect(() => {
    initCloudSync((status) => {
      setCloudStatus(status);
    });
  }, []);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [darkTheme, setDarkTheme] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleToggleTheme = () => {
    setDarkTheme((prev) => !prev);
  };

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (store.site.accent) {
      root.style.setProperty('--accent', store.site.accent);
    }
    if (store.site.fontHead) {
      root.style.setProperty('--font-display', `'${store.site.fontHead}', sans-serif`);
    }
    if (store.site.fontBody) {
      root.style.setProperty('--font-body', `'${store.site.fontBody}', sans-serif`);
    }
  }, [store.site]);

  const currentUser = store.users.find((u) => u.id === store.currentUid) || null;

  const currentStudent =
    store.students.find((s) => s.id === store.currentUid) ||
    (currentUser
      ? {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          joinedAt: currentUser.joinedAt,
        }
      : store.students[0]);

  const studentEnrolled = store.currentUid ? store.enrolled[store.currentUid] || {} : {};
  const studentAttendance = store.currentUid ? store.attendance[store.currentUid] || {} : {};
  const studentResults = store.currentUid ? store.quizResults[store.currentUid] || {} : {};
  const studentAttempts = store.currentUid ? store.quizAttempts[store.currentUid] || {} : {};

  const myProjects = store.currentUid
    ? Object.values(store.projects).filter((p) => p.uid === store.currentUid)
    : [];

  const pendingProjectsCount = Object.values(store.projects).filter((p) => {
    const rev = store.reviews[p.id];
    return !rev || (p.updatedAt || 0) > rev.at;
  }).length;

  const userNotifications = store.notifications.filter(
    (n) => !n.targetUid || n.targetUid === store.currentUid
  );
  const unreadNotificationsCount = userNotifications.filter((n) => !n.read).length;

  // --- Profile & Auth Handlers ---
  const handleLogin = (email: string, code: string) => {
    const res = appStorage.loginWithCode(email, code);
    if (res.success && res.user) {
      const isOwnerLogin = res.user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      showToast(
        isOwnerLogin
          ? `أهلاً بك مجدداً يا مالك المنصة (${res.user.name})!`
          : `أهلاً بك، ${res.user.name}!`
      );
    }
    return res;
  };

  const handleRegister = (email: string, code: string, name: string) => {
    const res = appStorage.registerWithCode(email, code, name);
    if (res.success && res.user) {
      saveUserToCloud(res.user);
      const isOwnerLogin = res.user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      showToast(
        isOwnerLogin
          ? `تم إنشاء وتفعيل حساب مالك المنصة (${res.user.name}) بنجاح!`
          : 'تم إرسال طلب انضمامك لقاعدة البيانات السحابية بنجاح! بانتظار موافقة مالك المنصة لتفعيل وصولك.'
      );
    }
    return res;
  };

  const handleLogout = () => {
    appStorage.logout();
    showToast('تم تسجيل الخروج بنجاح.');
    setCurrentTab('cal');
  };

  const handleUpdateProfile = (updates: Partial<UserAccount>) => {
    if (!currentUser) return;
    appStorage.updateProfile(currentUser.id, updates);
    updateUserProfileInCloud(currentUser.id, updates);
    showToast('تم حفظ وتحديث بيانات ملفك الشخصي بنجاح.');
  };

  // --- Notifications Handlers ---
  const handleMarkNotificationAsRead = (id: string) => {
    appStorage.markNotificationAsRead(id);
  };

  const handleMarkAllNotificationsAsRead = () => {
    appStorage.markAllNotificationsAsRead(currentUser?.id);
    showToast('تم تحديد جميع الإشعارات كمقروءة.');
  };

  const handleDeleteNotification = (id: string) => {
    appStorage.deleteNotification(id);
    showToast('تم حذف الإشعار.');
  };

  // --- Scientific Questions Handlers ---
  const handleAddScientificQuestion = (data: {
    title: string;
    content: string;
    courseId?: string;
    courseTitle?: string;
    tags?: string[];
  }) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newQId = `q_${Date.now()}`;
    const questionObj: ScientificQuestion = {
      id: newQId,
      uid: currentUser.id,
      authorName: currentUser.name,
      ...data,
      createdAt: Date.now(),
      answers: [],
      status: 'open',
    };
    appStorage.addScientificQuestion(questionObj);
    saveQuestionToCloud(questionObj);
    // Add in-app notification
    appStorage.addNotification({
      title: 'سؤال علمي جديد في المنصة',
      message: `طرح ${currentUser.name} سؤالاً علمياً جديداً: "${data.title}"`,
      type: 'question',
      linkTab: 'questions',
    });
    showToast('تم نشر سؤالك العلمي في السحابة بنجاح!');
  };

  const handleAddScientificAnswer = (questionId: string, content: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    appStorage.addScientificAnswer(questionId, {
      uid: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content,
    });
    const updatedQ = appStorage.getSnapshot().questions.find((q) => q.id === questionId);
    if (updatedQ) {
      saveQuestionToCloud(updatedQ);
    }
    showToast('تمت إضافة إجابتك العلمية ومزامنتها.');
  };

  const handleToggleVerifyAnswer = (questionId: string, answerId: string) => {
    appStorage.toggleVerifyAnswer(questionId, answerId);
    const updatedQ = appStorage.getSnapshot().questions.find((q) => q.id === questionId);
    if (updatedQ) {
      saveQuestionToCloud(updatedQ);
    }
    showToast('تم تحديث حالة اعتماد الإجابة.');
  };

  const handleDeleteScientificQuestion = (questionId: string) => {
    appStorage.deleteScientificQuestion(questionId);
    deleteQuestionFromCloud(questionId);
    showToast('تم حذف السؤال العلمي.');
  };

  // --- Course Materials Handlers ---
  const handleAddCourseMaterial = (courseId: string, mat: Omit<CourseMaterial, 'id'>) => {
    appStorage.addCourseMaterial(courseId, mat);
    showToast('تمت إضافة المادة والملف التعليمي للمقرر.');
  };

  const handleDeleteCourseMaterial = (courseId: string, materialId: string) => {
    appStorage.deleteCourseMaterial(courseId, materialId);
    showToast('تم حذف الملف التعليمي.');
  };

  // --- Attendance & Student Handlers ---
  const handleSaveAttendance = (lessonId: string, attended: boolean) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('يرجى تسجيل الدخول أولاً لتسجيل حضورك.');
      return;
    }
    if (currentUser.status === 'pending') {
      showToast('حسابك قيد المراجعة بانتظار موافقة مالك الموقع لتسجيل الحضور.');
      return;
    }

    appStorage.update((draft) => {
      if (!draft.attendance[draft.currentUid]) {
        draft.attendance[draft.currentUid] = {};
      }
      const existing = draft.attendance[draft.currentUid][lessonId] || {};
      draft.attendance[draft.currentUid][lessonId] = {
        ...existing,
        attended: attended ? Date.now() : null,
        opened: existing.opened || Date.now(),
      };
    });
    showToast(attended ? 'تم تسجيل حضورك بنجاح ✓' : 'تم إلغاء تسجيل الحضور');
  };

  const handleOpenLesson = (lessonId: string) => {
    if (!store.currentUid) return;
    appStorage.update((draft) => {
      if (!draft.attendance[draft.currentUid]) {
        draft.attendance[draft.currentUid] = {};
      }
      const existing = draft.attendance[draft.currentUid][lessonId] || {};
      if (!existing.opened) {
        draft.attendance[draft.currentUid][lessonId] = {
          ...existing,
          opened: Date.now(),
        };
      }
    });
  };

  const handleEnroll = (courseId: string, enroll: boolean) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('يرجى تسجيل الدخول أولاً للتسجيل في الدورات.');
      return;
    }
    if (currentUser.status === 'pending') {
      showToast('حسابك قيد المراجعة بانتظار موافقة مالك الموقع.');
      return;
    }

    appStorage.update((draft) => {
      if (!draft.enrolled[draft.currentUid]) {
        draft.enrolled[draft.currentUid] = {};
      }
      if (enroll) {
        draft.enrolled[draft.currentUid][courseId] = { at: Date.now() };
      } else {
        delete draft.enrolled[draft.currentUid][courseId];
      }
    });
    showToast(enroll ? 'تم تسجيلك في الدورة بنجاح' : 'تم إلغاء تسجيلك في الدورة');
  };

  const handleStartQuizAttempt = (quizId: string) => {
    if (!store.currentUid) {
      setIsAuthModalOpen(true);
      return;
    }
    appStorage.update((draft) => {
      if (!draft.quizAttempts[draft.currentUid]) {
        draft.quizAttempts[draft.currentUid] = {};
      }
      draft.quizAttempts[draft.currentUid][quizId] = { startedAt: Date.now() };
    });
  };

  const handleSubmitQuizResult = (quizId: string, score: number, total: number) => {
    if (!store.currentUid) return;
    appStorage.update((draft) => {
      if (!draft.quizResults[draft.currentUid]) {
        draft.quizResults[draft.currentUid] = {};
      }
      const prev = draft.quizResults[draft.currentUid][quizId];
      const best = Math.max(score, prev?.best || 0);
      draft.quizResults[draft.currentUid][quizId] = {
        score,
        total,
        best,
        at: Date.now(),
      };
    });
    showToast(`تم إنهاء الاختبار وتسجيل نتيجتك: ${score} من ${total}`);
  };

  const handleSaveStudentName = (name: string) => {
    if (!store.currentUid) return;
    appStorage.update((draft) => {
      const u = draft.users.find((x) => x.id === draft.currentUid);
      if (u) u.name = name;
      const stu = draft.students.find((s) => s.id === draft.currentUid);
      if (stu) stu.name = name;
    });
    showToast('تم حفظ اسمك المعتمد');
  };

  const handleSaveProject = (data: Partial<Project>, projectId?: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (currentUser.status === 'pending') {
      showToast('حسابك قيد المراجعة بانتظار موافقة مالك الموقع.');
      return;
    }

    const id = projectId || `proj_${Date.now()}`;
    appStorage.update((draft) => {
      const now = Date.now();
      if (projectId && draft.projects[projectId]) {
        draft.projects[projectId] = {
          ...draft.projects[projectId],
          ...data,
          updatedAt: now,
        };
      } else {
        draft.projects[id] = {
          id,
          uid: draft.currentUid,
          title: data.title || 'مشروع جديد',
          text: data.text || '',
          link: data.link || '',
          courseId: data.courseId || '',
          createdAt: now,
          updatedAt: now,
        };
      }
    });
    showToast(projectId ? 'تم تحديث بيانات المشروع' : 'تم تسليم المشروع للمراجعة بنجاح');
  };

  const handleDeleteProject = (projectId: string) => {
    appStorage.update((draft) => {
      delete draft.projects[projectId];
      delete draft.reviews[projectId];
    });
    showToast('تم حذف المشروع');
  };

  const handleSaveReview = (projectId: string, review: ProjectReview) => {
    appStorage.update((draft) => {
      draft.reviews[projectId] = review;
    });
    showToast('تم اعتماد تقييم المشروع ومشاركته مع الطالب');
  };

  const handleIssueCertificate = (courseId: string, uid: string) => {
    appStorage.update((draft) => {
      const exists = draft.certificates.some(
        (c) => c.courseId === courseId && c.uid === uid
      );
      if (exists) return;
      const serial = 'E' + Date.now().toString(36).toUpperCase().slice(-5);
      draft.certificates.push({
        id: `${courseId}_${uid}`,
        courseId,
        uid,
        issuedAt: Date.now(),
        serial,
      });
    });
    showToast('تم إصدار الشهادة الرسمية بنجاح 🎓');
  };

  const handleAssignTeacherCourses = (teacherId: string, courseIds: string[]) => {
    appStorage.update((draft) => {
      const teacher = draft.teachers.find((t) => t.id === teacherId);
      if (teacher) {
        teacher.courses = courseIds;
      }
    });
    showToast('تم تحديث الدورات المعينة للمعلم');
  };

  // --- Owner User Management Actions ---
  const handleApproveUser = (uid: string) => {
    appStorage.approveUser(uid);
    updateUserStatusInCloud(uid, 'active');
    showToast('تم قبول المستخدم وتفعيل حسابه سحابياً بنجاح.');
  };

  const handleSuspendUser = (uid: string, suspend: boolean) => {
    appStorage.suspendUser(uid, suspend);
    updateUserStatusInCloud(uid, suspend ? 'suspended' : 'active');
    showToast(suspend ? 'تم إغلاق وتعليق حساب المستخدم سحابياً.' : 'تمت إعادة فتح وتفعيل الحساب سحابياً.');
  };

  const handleDeleteUser = (uid: string) => {
    appStorage.deleteUser(uid);
    deleteUserFromCloud(uid);
    showToast('تم حذف المستخدم وجميع سجلاته من السحابة بنجاح.');
  };

  const handlePromoteUser = (uid: string, newRole: Role) => {
    appStorage.promoteUser(uid, newRole);
    updateUserRoleInCloud(uid, newRole);
    showToast(
      newRole === 'teacher'
        ? 'تمت ترقية الطالب إلى رتبة معلم مشرف في السحابة.'
        : 'تم تغيير دور المستخدم إلى طالب في السحابة.'
    );
  };

  // Course, lesson, quiz, block handlers
  const handleSaveCourse = (courseData: Partial<Course>, id?: string) => {
    appStorage.update((draft) => {
      if (id) {
        const idx = draft.courses.findIndex((c) => c.id === id);
        if (idx >= 0) {
          draft.courses[idx] = { ...draft.courses[idx], ...courseData };
        }
      } else {
        const newId = `course_${Date.now()}`;
        draft.courses.push({
          id: newId,
          title: courseData.title || '',
          desc: courseData.desc || '',
          teacher: courseData.teacher || '',
          minAtt: courseData.minAtt || 80,
          minScore: courseData.minScore || 60,
          type: courseData.type || 'course',
          category: courseData.category || '',
          materials: [],
          createdAt: Date.now(),
        });
      }
    });
    showToast(id ? 'تم تعديل المقرر' : 'تمت إضافة المقرر بنجاح');
  };

  const handleDeleteCourse = (id: string) => {
    appStorage.update((draft) => {
      draft.courses = draft.courses.filter((c) => c.id !== id);
    });
    showToast('تم حذف المقرر');
  };

  const handleSaveLesson = (lessonData: Partial<Lesson>, id?: string) => {
    appStorage.update((draft) => {
      if (id) {
        const idx = draft.lessons.findIndex((l) => l.id === id);
        if (idx >= 0) {
          draft.lessons[idx] = { ...draft.lessons[idx], ...lessonData };
        }
      } else {
        const newId = `les_${Date.now()}`;
        draft.lessons.push({
          id: newId,
          title: lessonData.title || '',
          courseId: lessonData.courseId || '',
          date: lessonData.date || formatDateKey(new Date()),
          url: lessonData.url || '',
          createdAt: Date.now(),
        });
      }
    });
    showToast(id ? 'تم تعديل الدرس' : 'تمت إضافة الدرس بنجاح');
  };

  const handleDeleteLesson = (id: string) => {
    appStorage.update((draft) => {
      draft.lessons = draft.lessons.filter((l) => l.id !== id);
    });
    showToast('تم حذف الدرس');
  };

  const handleSaveQuiz = (quizData: Partial<Quiz>, id?: string) => {
    appStorage.update((draft) => {
      if (id) {
        const idx = draft.quizzes.findIndex((q) => q.id === id);
        if (idx >= 0) {
          draft.quizzes[idx] = { ...draft.quizzes[idx], ...quizData };
        }
      } else {
        const newId = `quiz_${Date.now()}`;
        draft.quizzes.push({
          id: newId,
          title: quizData.title || '',
          courseId: quizData.courseId || '',
          minutes: quizData.minutes || 0,
          single: !!quizData.single,
          questions: quizData.questions || [],
          createdAt: Date.now(),
        });
      }
    });
    showToast(id ? 'تم تعديل الاختبار' : 'تم نشر الاختبار بنجاح');
  };

  const handleDeleteQuiz = (id: string) => {
    appStorage.update((draft) => {
      draft.quizzes = draft.quizzes.filter((q) => q.id !== id);
    });
    showToast('تم حذف الاختبار');
  };

  const handleSaveBlock = (blockData: Partial<Announcement>, id?: string) => {
    const annId = id || `ann_${Date.now()}`;
    const annObj: Announcement = {
      id: annId,
      title: blockData.title || '',
      text: blockData.text || '',
      linkLabel: blockData.linkLabel || '',
      linkUrl: blockData.linkUrl || '',
      courseId: blockData.courseId || '',
      createdAt: Date.now(),
    };
    saveAnnouncementToCloud(annObj);

    appStorage.update((draft) => {
      if (id) {
        const idx = draft.blocks.findIndex((b) => b.id === id);
        if (idx >= 0) {
          draft.blocks[idx] = { ...draft.blocks[idx], ...blockData };
        }
      } else {
        draft.blocks.push(annObj);

        // Broadcast notification to all students
        draft.notifications.unshift({
          id: `notif_${Date.now()}`,
          title: 'إعلان جديد من الإدارة: ' + (blockData.title || ''),
          message: blockData.text || 'انقر للاطلاع على تفاصيل الإعلان.',
          type: 'announcement',
          createdAt: Date.now(),
          read: false,
          linkTab: 'cal',
        });
      }
    });
    showToast(id ? 'تم تعديل الإعلان سحابياً' : 'تم نشر الإعلان سحابياً وإرسال إشعار للطلاب');
  };

  const handleDeleteBlock = (id: string) => {
    appStorage.update((draft) => {
      draft.blocks = draft.blocks.filter((b) => b.id !== id);
    });
    deleteAnnouncementFromCloud(id);
    showToast('تم حذف الإعلان من السحابة');
  };

  const handleUpdateSite = (newSite: SiteSettings) => {
    appStorage.update((draft) => {
      draft.site = newSite;
    });
    showToast('تم تحديث هوية المنصة وإعداداتها بنجاح');
  };

  const handleUpdateCertBg = (bgDataUrl: string) => {
    appStorage.update((draft) => {
      draft.certBg = bgDataUrl;
    });
  };

  const handleResetAllData = () => {
    appStorage.resetToDefault();
    showToast('تمت إعادة تعيين بيانات المنصة إلى الوضع التجريبي الأولي');
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col justify-between transition-all">
      <div className="w-full">
        {/* Header with Notifications & Edit Profile triggers */}
        <Header
          site={store.site}
          currentUser={currentUser}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onLogout={handleLogout}
          darkTheme={darkTheme}
          onToggleTheme={handleToggleTheme}
          cloudStatus={cloudStatus}
        />

        {/* Guest Warning / Pending Approval Banner */}
        {!currentUser && (
          <div className="p-3.5 mb-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
              <span>أنت تتصفح كزائر. سجّل دخولك لتسجيل الحضور وتسلّم شهادتك.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              تسجيل الدخول
            </button>
          </div>
        )}

        {currentUser && currentUser.status === 'pending' && (
          <div className="p-3.5 mb-3 rounded-2xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">طلب انضمامك قيد المراجعة</span>
              <span className="opacity-90 leading-relaxed">
                حسابك بانتظار موافقة مالك المنصة لاعتماد تسجيلك وتفعيل صلاحيات الحضور والاختبارات.
              </span>
            </div>
          </div>
        )}

        {currentUser && currentUser.status === 'suspended' && (
          <div className="p-3.5 mb-3 rounded-2xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5 shadow-xs">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">تم إغلاق حسابك</span>
              <span className="opacity-90 leading-relaxed">
                تم إغلاق هذا الحساب من قبل مالك الموقع. يرجى مراجعة إدارة المنصة.
              </span>
            </div>
          </div>
        )}

        {/* Main Views */}
        <main className="pb-6">
          {currentTab === 'cal' && (
            <CalendarView
              site={store.site}
              courses={store.courses}
              lessons={store.lessons}
              blocks={store.blocks}
              enrolled={studentEnrolled}
              attendance={studentAttendance}
              onSaveAttendance={handleSaveAttendance}
              onOpenLesson={handleOpenLesson}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'courses' && (
            <CoursesView
              courses={store.courses}
              lessons={store.lessons}
              enrolled={studentEnrolled}
              student={currentStudent}
              role={store.currentRole}
              onEnroll={handleEnroll}
              onAddMaterial={handleAddCourseMaterial}
              onDeleteMaterial={handleDeleteCourseMaterial}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'questions' && (
            <ScientificQuestionsView
              questions={store.questions}
              courses={store.courses}
              currentUser={currentUser}
              onAddQuestion={handleAddScientificQuestion}
              onAddAnswer={handleAddScientificAnswer}
              onToggleVerifyAnswer={handleToggleVerifyAnswer}
              onDeleteQuestion={handleDeleteScientificQuestion}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizzesView
              quizzes={store.quizzes}
              courses={store.courses}
              enrolled={studentEnrolled}
              results={studentResults}
              attempts={studentAttempts}
              onStartAttempt={handleStartQuizAttempt}
              onSubmitResult={handleSubmitQuizResult}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'certs' && (
            <CertificatesView
              site={store.site}
              certBg={store.certBg}
              courses={store.courses}
              lessons={store.lessons}
              quizzes={store.quizzes}
              certificates={store.certificates}
              enrolled={studentEnrolled}
              attendance={studentAttendance}
              quizResults={studentResults}
              student={currentStudent}
              onSaveStudentName={handleSaveStudentName}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              projects={myProjects}
              reviews={store.reviews}
              courses={store.courses}
              enrolled={studentEnrolled}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPanel
              site={store.site}
              certBg={store.certBg}
              courses={store.courses}
              lessons={store.lessons}
              quizzes={store.quizzes}
              blocks={store.blocks}
              users={store.users}
              students={store.students}
              teachers={store.teachers}
              attendance={store.attendance}
              quizResults={store.quizResults}
              enrolled={store.enrolled}
              certificates={store.certificates}
              projects={store.projects}
              reviews={store.reviews}
              role={store.currentRole}
              currentUserEmail={currentUser?.email}
              onUpdateSite={handleUpdateSite}
              onUpdateCertBg={handleUpdateCertBg}
              onSaveCourse={handleSaveCourse}
              onDeleteCourse={handleDeleteCourse}
              onSaveLesson={handleSaveLesson}
              onDeleteLesson={handleDeleteLesson}
              onSaveQuiz={handleSaveQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              onSaveBlock={handleSaveBlock}
              onDeleteBlock={handleDeleteBlock}
              onSaveReview={handleSaveReview}
              onIssueCertificate={handleIssueCertificate}
              onAssignTeacherCourses={handleAssignTeacherCourses}
              onApproveUser={handleApproveUser}
              onSuspendUser={handleSuspendUser}
              onDeleteUser={handleDeleteUser}
              onPromoteUser={handlePromoteUser}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      {store.site.footer && (
        <footer className="text-center text-xs text-[var(--muted)] py-4 whitespace-pre-line leading-relaxed opacity-80">
          {store.site.footer}
        </footer>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 px-4 py-2.5 rounded-2xl bg-[var(--fg)] text-[var(--bg)] text-xs sm:text-sm font-semibold shadow-xl max-w-[90vw] text-center animate-slide-up"
        >
          {toastMessage}
        </div>
      )}

      {/* Bottom Tabs Navigation */}
      <TabsNav
        site={store.site}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        role={store.currentRole}
        pendingProjectsCount={pendingProjectsCount}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={store.notifications}
        currentUid={currentUser?.id}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onDeleteNotification={handleDeleteNotification}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
}
