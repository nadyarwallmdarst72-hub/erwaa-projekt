import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from '../firebase';
import {
  UserAccount,
  Announcement,
  ScientificQuestion,
  Course,
  Lesson,
  Quiz,
  SiteSettings,
  UserStatus,
  Role,
} from '../types';
import { appStorage } from '../storage';

let isSyncInitialized = false;

export async function initCloudSync(
  onStatusChange?: (status: 'connected' | 'syncing' | 'error') => void
) {
  if (isSyncInitialized) return;
  isSyncInitialized = true;

  try {
    onStatusChange?.('syncing');
    const isConnected = await testConnection();
    if (!isConnected) {
      onStatusChange?.('error');
    } else {
      onStatusChange?.('connected');
    }

    const localSnapshot = appStorage.getSnapshot();

    // 0. Synchronize Site Identity & General Settings in Real-Time
    const settingsDocRef = doc(db, 'settings', 'general');
    try {
      const settingsSnap = await getDoc(settingsDocRef);
      if (!settingsSnap.exists() && localSnapshot.site) {
        await setDoc(settingsDocRef, {
          site: localSnapshot.site,
          ...localSnapshot.site,
          certBg: localSnapshot.certBg || '',
          updatedAt: Date.now(),
        });
      }
    } catch (e) {
      console.warn('Initial settings seed check error:', e);
    }

    onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            const cloudSite: Partial<SiteSettings> = data.site || {
              name: data.name,
              tagline: data.tagline,
              desc: data.desc,
              logo: data.logo,
              accent: data.accent,
              fontHead: data.fontHead,
              fontBody: data.fontBody,
              heroBadge: data.heroBadge,
              heroTitle: data.heroTitle,
              heroSub: data.heroSub,
              footer: data.footer,
            };
            appStorage.syncCloudSiteSettings(cloudSite, data.certBg);
          }
        }
      },
      (error) => {
        console.warn('Real-time settings sync error:', error);
      }
    );

    // 1. Synchronize Users Collection
    const usersCol = collection(db, 'users');
    try {
      const usersSnap = await getDocs(usersCol);
      if (usersSnap.empty && localSnapshot.users.length > 0) {
        for (const u of localSnapshot.users) {
          await setDoc(doc(db, 'users', u.id), u);
        }
      }
    } catch (e) {
      console.warn('Initial users seed check error:', e);
    }

    onSnapshot(
      usersCol,
      (snapshot) => {
        const cloudUsers: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          cloudUsers.push(docSnap.data() as UserAccount);
        });
        if (cloudUsers.length > 0) {
          appStorage.syncCloudUsers(cloudUsers);
        }
        onStatusChange?.('connected');
      },
      (error) => {
        onStatusChange?.('error');
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    // 2. Synchronize Courses Collection
    const coursesCol = collection(db, 'courses');
    try {
      const coursesSnap = await getDocs(coursesCol);
      if (coursesSnap.empty && localSnapshot.courses.length > 0) {
        for (const c of localSnapshot.courses) {
          await setDoc(doc(db, 'courses', c.id), c);
        }
      }
    } catch (e) {
      console.warn('Initial courses seed check error:', e);
    }

    onSnapshot(
      coursesCol,
      (snapshot) => {
        const cloudCourses: Course[] = [];
        snapshot.forEach((docSnap) => {
          cloudCourses.push(docSnap.data() as Course);
        });
        if (cloudCourses.length > 0) {
          appStorage.syncCloudCourses(cloudCourses);
        }
      },
      (error) => {
        console.warn('Courses sync error:', error);
      }
    );

    // 3. Synchronize Lessons Collection (with exercises)
    const lessonsCol = collection(db, 'lessons');
    try {
      const lessonsSnap = await getDocs(lessonsCol);
      if (lessonsSnap.empty && localSnapshot.lessons.length > 0) {
        for (const l of localSnapshot.lessons) {
          await setDoc(doc(db, 'lessons', l.id), l);
        }
      }
    } catch (e) {
      console.warn('Initial lessons seed check error:', e);
    }

    onSnapshot(
      lessonsCol,
      (snapshot) => {
        const cloudLessons: Lesson[] = [];
        snapshot.forEach((docSnap) => {
          cloudLessons.push(docSnap.data() as Lesson);
        });
        if (cloudLessons.length > 0) {
          appStorage.syncCloudLessons(cloudLessons);
        }
      },
      (error) => {
        console.warn('Lessons sync error:', error);
      }
    );

    // 4. Synchronize Quizzes Collection
    const quizzesCol = collection(db, 'quizzes');
    try {
      const quizzesSnap = await getDocs(quizzesCol);
      if (quizzesSnap.empty && localSnapshot.quizzes.length > 0) {
        for (const q of localSnapshot.quizzes) {
          await setDoc(doc(db, 'quizzes', q.id), q);
        }
      }
    } catch (e) {
      console.warn('Initial quizzes seed check error:', e);
    }

    onSnapshot(
      quizzesCol,
      (snapshot) => {
        const cloudQuizzes: Quiz[] = [];
        snapshot.forEach((docSnap) => {
          cloudQuizzes.push(docSnap.data() as Quiz);
        });
        if (cloudQuizzes.length > 0) {
          appStorage.syncCloudQuizzes(cloudQuizzes);
        }
      },
      (error) => {
        console.warn('Quizzes sync error:', error);
      }
    );

    // 5. Synchronize Announcements Collection
    const announcementsCol = collection(db, 'announcements');
    try {
      const announcementsSnap = await getDocs(announcementsCol);
      if (announcementsSnap.empty && localSnapshot.blocks.length > 0) {
        for (const b of localSnapshot.blocks) {
          await setDoc(doc(db, 'announcements', b.id), b);
        }
      }
    } catch (e) {
      console.warn('Initial announcements seed check error:', e);
    }

    onSnapshot(
      announcementsCol,
      (snapshot) => {
        const cloudAnnouncements: Announcement[] = [];
        snapshot.forEach((docSnap) => {
          cloudAnnouncements.push(docSnap.data() as Announcement);
        });
        if (cloudAnnouncements.length > 0) {
          appStorage.syncCloudAnnouncements(cloudAnnouncements);
        }
      },
      (error) => {
        console.warn('Announcements sync error:', error);
      }
    );

    // 6. Synchronize Scientific Questions
    const questionsCol = collection(db, 'questions');
    try {
      const questionsSnap = await getDocs(questionsCol);
      if (questionsSnap.empty && localSnapshot.questions.length > 0) {
        for (const q of localSnapshot.questions) {
          await setDoc(doc(db, 'questions', q.id), q);
        }
      }
    } catch (e) {
      console.warn('Initial questions seed check error:', e);
    }

    onSnapshot(
      questionsCol,
      (snapshot) => {
        const cloudQuestions: ScientificQuestion[] = [];
        snapshot.forEach((docSnap) => {
          cloudQuestions.push(docSnap.data() as ScientificQuestion);
        });
        if (cloudQuestions.length > 0) {
          appStorage.syncCloudQuestions(cloudQuestions);
        }
      },
      (error) => {
        console.warn('Questions sync error:', error);
      }
    );
  } catch (err) {
    console.error('Failed to initialize cloud sync:', err);
    onStatusChange?.('error');
  }
}

// --- Cloud Mutation Operations (Add, Update, Delete with immediate propagation) ---

export async function saveUserToCloud(user: UserAccount): Promise<void> {
  try {
    await setDoc(doc(db, 'users', user.id), user, { merge: true });
  } catch (error) {
    console.error('Failed to save user to cloud:', error);
  }
}

export async function updateUserStatusInCloud(uid: string, status: UserStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { status });
  } catch (error) {
    console.error('Failed to update user status in cloud:', error);
  }
}

export async function updateUserRoleInCloud(uid: string, role: Role): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { role });
  } catch (error) {
    console.error('Failed to update user role in cloud:', error);
  }
}

export async function updateUserProfileInCloud(uid: string, updates: Partial<UserAccount>): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
  } catch (error) {
    console.error('Failed to update user profile in cloud:', error);
  }
}

export async function deleteUserFromCloud(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Failed to delete user from cloud:', error);
  }
}

export async function saveAnnouncementToCloud(announcement: Announcement): Promise<void> {
  try {
    await setDoc(doc(db, 'announcements', announcement.id), announcement, { merge: true });
  } catch (error) {
    console.error('Failed to save announcement to cloud:', error);
  }
}

export async function deleteAnnouncementFromCloud(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (error) {
    console.error('Failed to delete announcement from cloud:', error);
  }
}

export async function saveQuestionToCloud(question: ScientificQuestion): Promise<void> {
  try {
    await setDoc(doc(db, 'questions', question.id), question, { merge: true });
  } catch (error) {
    console.error('Failed to save question to cloud:', error);
  }
}

export async function deleteQuestionFromCloud(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'questions', id));
  } catch (error) {
    console.error('Failed to delete question from cloud:', error);
  }
}

export async function saveCourseToCloud(course: Course): Promise<void> {
  try {
    await setDoc(doc(db, 'courses', course.id), course, { merge: true });
  } catch (error) {
    console.error('Failed to save course to cloud:', error);
  }
}

export async function deleteCourseFromCloud(courseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    console.error('Failed to delete course from cloud:', error);
  }
}

export async function saveLessonToCloud(lesson: Lesson): Promise<void> {
  try {
    await setDoc(doc(db, 'lessons', lesson.id), lesson, { merge: true });
  } catch (error) {
    console.error('Failed to save lesson to cloud:', error);
  }
}

export async function deleteLessonFromCloud(lessonId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    console.error('Failed to delete lesson from cloud:', error);
  }
}

export async function saveQuizToCloud(quiz: Quiz): Promise<void> {
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz, { merge: true });
  } catch (error) {
    console.error('Failed to save quiz to cloud:', error);
  }
}

export async function deleteQuizFromCloud(quizId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'quizzes', quizId));
  } catch (error) {
    console.error('Failed to delete quiz from cloud:', error);
  }
}

export async function saveSiteSettingsToCloud(site: SiteSettings, certBg?: string): Promise<void> {
  try {
    const settingsDocRef = doc(db, 'settings', 'general');
    await setDoc(
      settingsDocRef,
      {
        site,
        ...site,
        certBg: certBg !== undefined ? certBg : '',
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save site settings to cloud:', error);
  }
}
