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
} from './types';
import { Header } from './components/Header';
import { TabsNav, MainTabKey } from './components/TabsNav';
import { CalendarView } from './components/CalendarView';
import { CoursesView } from './components/CoursesView';
import { QuizzesView } from './components/QuizzesView';
import { CertificatesView } from './components/CertificatesView';
import { ProjectsView } from './components/ProjectsView';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const store = useSyncExternalStore(
    (onStoreChange) => appStorage.subscribe(onStoreChange),
    () => appStorage.getSnapshot()
  );

  const [currentTab, setCurrentTab] = useState<MainTabKey>('cal');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [darkTheme, setDarkTheme] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Toggle theme
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

  // Apply dynamic colors and fonts
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

  const currentStudent =
    store.students.find((s) => s.id === store.currentUid) || store.students[0];

  const studentEnrolled = store.enrolled[store.currentUid] || {};
  const studentAttendance = store.attendance[store.currentUid] || {};
  const studentResults = store.quizResults[store.currentUid] || {};
  const studentAttempts = store.quizAttempts[store.currentUid] || {};

  const myProjects = Object.values(store.projects).filter(
    (p) => p.uid === store.currentUid
  );

  // Pending reviews count for admin/teacher
  const pendingProjectsCount = Object.values(store.projects).filter((p) => {
    const rev = store.reviews[p.id];
    return !rev || (p.updatedAt || 0) > rev.at;
  }).length;

  // --- Handlers ---
  const handleRoleChange = (newRole: Role) => {
    appStorage.update((draft) => {
      draft.currentRole = newRole;
    });
    showToast(
      newRole === 'owner'
        ? 'تم التبديل إلى منظور مدير المنصة'
        : newRole === 'teacher'
        ? 'تم التبديل إلى منظور المعلم المشرف'
        : 'تم التبديل إلى منظور الطالب'
    );
  };

  const handleSaveAttendance = (lessonId: string, attended: boolean) => {
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
    appStorage.update((draft) => {
      if (!draft.quizAttempts[draft.currentUid]) {
        draft.quizAttempts[draft.currentUid] = {};
      }
      draft.quizAttempts[draft.currentUid][quizId] = { startedAt: Date.now() };
    });
  };

  const handleSubmitQuizResult = (quizId: string, score: number, total: number) => {
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
    appStorage.update((draft) => {
      const stu = draft.students.find((s) => s.id === draft.currentUid);
      if (stu) {
        stu.name = name;
      }
    });
    showToast('تم حفظ اسمك المعتمد');
  };

  const handleSaveProject = (data: Partial<Project>, projectId?: string) => {
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
          createdAt: Date.now(),
        });
      }
    });
    showToast(id ? 'تم تعديل الدورة' : 'تمت إضافة الدورة بنجاح');
  };

  const handleDeleteCourse = (id: string) => {
    appStorage.update((draft) => {
      draft.courses = draft.courses.filter((c) => c.id !== id);
    });
    showToast('تم حذف الدورة');
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
    appStorage.update((draft) => {
      if (id) {
        const idx = draft.blocks.findIndex((b) => b.id === id);
        if (idx >= 0) {
          draft.blocks[idx] = { ...draft.blocks[idx], ...blockData };
        }
      } else {
        const newId = `ann_${Date.now()}`;
        draft.blocks.push({
          id: newId,
          title: blockData.title || '',
          text: blockData.text || '',
          linkLabel: blockData.linkLabel || '',
          linkUrl: blockData.linkUrl || '',
          courseId: blockData.courseId || '',
          createdAt: Date.now(),
        });
      }
    });
    showToast(id ? 'تم تعديل الإعلان' : 'تم نشر الإعلان بنجاح');
  };

  const handleDeleteBlock = (id: string) => {
    appStorage.update((draft) => {
      draft.blocks = draft.blocks.filter((b) => b.id !== id);
    });
    showToast('تم حذف الإعلان');
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
    <div className="max-w-[560px] mx-auto min-h-screen flex flex-col justify-between">
      <div>
        {/* Header */}
        <Header
          site={store.site}
          currentRole={store.currentRole}
          onRoleChange={handleRoleChange}
          darkTheme={darkTheme}
          onToggleTheme={handleToggleTheme}
        />

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
              onEnroll={handleEnroll}
              onNavigateTab={(tab) => setCurrentTab(tab)}
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
              students={store.students}
              teachers={store.teachers}
              attendance={store.attendance}
              quizResults={store.quizResults}
              enrolled={store.enrolled}
              certificates={store.certificates}
              projects={store.projects}
              reviews={store.reviews}
              role={store.currentRole}
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
    </div>
  );
}
