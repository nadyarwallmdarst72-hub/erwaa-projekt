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
  AttendanceRecord,
  QuizResult,
  Certificate,
  ResourceFile,
  LessonComment,
} from '../types';
import { appStorage } from '../storage';
import { compressImage } from '../utils/imageOptimizer';

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
            const nested = (data.site || {}) as Partial<SiteSettings>;
            const cloudSite: Partial<SiteSettings> = {
              name: nested.name ?? data.name,
              tagline: nested.tagline ?? data.tagline,
              logo: nested.logo ?? data.logo,
              accent: nested.accent ?? data.accent,
              fontHead: nested.fontHead ?? data.fontHead,
              fontBody: nested.fontBody ?? data.fontBody,
              welcomeTitle: nested.welcomeTitle ?? data.welcomeTitle,
              welcomeText: nested.welcomeText ?? data.welcomeText,
              clubImage: nested.clubImage ?? data.clubImage,
              clubAbout: nested.clubAbout ?? data.clubAbout,
              clubFeatures: nested.clubFeatures ?? data.clubFeatures,
              clubContact: nested.clubContact ?? data.clubContact,
              footer: nested.footer ?? data.footer,
              labels: nested.labels ?? data.labels,
              cert: nested.cert ?? data.cert,
            };
            // Clean undefined values
            Object.keys(cloudSite).forEach((k) => {
              if ((cloudSite as any)[k] === undefined) {
                delete (cloudSite as any)[k];
              }
            });
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

    // 7. Synchronize Attendance Records in Real-Time
    const attendanceCol = collection(db, 'attendance');
    onSnapshot(
      attendanceCol,
      (snapshot) => {
        const cloudAtt: Record<string, Record<string, AttendanceRecord>> = {};
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.studentUid && d.lessonId) {
            if (!cloudAtt[d.studentUid]) cloudAtt[d.studentUid] = {};
            cloudAtt[d.studentUid][d.lessonId] = {
              attended: d.attended ?? null,
              opened: d.opened ?? null,
            };
          }
        });
        if (Object.keys(cloudAtt).length > 0) {
          appStorage.syncCloudAttendance(cloudAtt);
        }
      },
      (error) => {
        console.warn('Attendance sync error:', error);
      }
    );

    // 8. Synchronize Quiz Results in Real-Time
    const quizResultsCol = collection(db, 'quiz_results');
    onSnapshot(
      quizResultsCol,
      (snapshot) => {
        const cloudRes: Record<string, Record<string, QuizResult>> = {};
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.studentUid && d.quizId) {
            if (!cloudRes[d.studentUid]) cloudRes[d.studentUid] = {};
            cloudRes[d.studentUid][d.quizId] = {
              score: d.score,
              total: d.total,
              best: d.best,
              at: d.at,
            };
          }
        });
        if (Object.keys(cloudRes).length > 0) {
          appStorage.syncCloudQuizResults(cloudRes);
        }
      },
      (error) => {
        console.warn('Quiz results sync error:', error);
      }
    );

    // 9. Synchronize Certificates in Real-Time
    const certsCol = collection(db, 'certificates');
    onSnapshot(
      certsCol,
      (snapshot) => {
        const cloudCerts: Certificate[] = [];
        snapshot.forEach((docSnap) => {
          cloudCerts.push(docSnap.data() as Certificate);
        });
        if (cloudCerts.length > 0) {
          appStorage.syncCloudCertificates(cloudCerts);
        }
      },
      (error) => {
        console.warn('Certificates sync error:', error);
      }
    );

    // 10. Synchronize Resource Center Files & Booklets in Real-Time
    const resourcesCol = collection(db, 'resources');
    try {
      const resSnap = await getDocs(resourcesCol);
      if (resSnap.empty && localSnapshot.resources && localSnapshot.resources.length > 0) {
        for (const res of localSnapshot.resources) {
          await setDoc(doc(db, 'resources', res.id), res);
        }
      }
    } catch (e) {
      console.warn('Initial resources seed check error:', e);
    }

    onSnapshot(
      resourcesCol,
      (snapshot) => {
        const cloudResources: ResourceFile[] = [];
        snapshot.forEach((docSnap) => {
          cloudResources.push(docSnap.data() as ResourceFile);
        });
        if (cloudResources.length > 0) {
          appStorage.syncCloudResources(cloudResources);
        }
      },
      (error) => {
        console.warn('Resources sync error:', error);
      }
    );

    // 11. Synchronize Interactive Lesson Comments & Q&A in Real-Time
    const commentsCol = collection(db, 'lesson_comments');
    try {
      const commSnap = await getDocs(commentsCol);
      if (commSnap.empty && localSnapshot.lessonComments && localSnapshot.lessonComments.length > 0) {
        for (const comm of localSnapshot.lessonComments) {
          await setDoc(doc(db, 'lesson_comments', comm.id), comm);
        }
      }
    } catch (e) {
      console.warn('Initial comments seed check error:', e);
    }

    onSnapshot(
      commentsCol,
      (snapshot) => {
        const cloudComments: LessonComment[] = [];
        snapshot.forEach((docSnap) => {
          cloudComments.push(docSnap.data() as LessonComment);
        });
        if (cloudComments.length > 0) {
          appStorage.syncCloudLessonComments(cloudComments);
        }
      },
      (error) => {
        console.warn('Lesson comments sync error:', error);
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
    const cleanSite: SiteSettings = JSON.parse(JSON.stringify(site));

    // Optimize images before saving to stay safely under Firestore's 1MB document limit
    if (cleanSite.clubImage && cleanSite.clubImage.startsWith('data:image')) {
      cleanSite.clubImage = await compressImage(cleanSite.clubImage, 1200, 800, 0.78);
    }
    if (cleanSite.logo && cleanSite.logo.startsWith('data:image')) {
      cleanSite.logo = await compressImage(cleanSite.logo, 400, 400, 0.82);
    }

    let cleanCertBg = certBg || '';
    if (cleanCertBg && cleanCertBg.startsWith('data:image')) {
      cleanCertBg = await compressImage(cleanCertBg, 1200, 850, 0.75);
    }

    const settingsDocRef = doc(db, 'settings', 'general');
    await setDoc(
      settingsDocRef,
      {
        site: cleanSite,
        ...cleanSite,
        certBg: cleanCertBg,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    console.log('Site settings and images successfully saved and synchronized to cloud!');
  } catch (error) {
    console.error('Failed to save site settings to cloud:', error);
    throw error;
  }
}

export async function saveAttendanceToCloud(
  studentUid: string,
  lessonId: string,
  record: AttendanceRecord
): Promise<void> {
  try {
    const recId = `${studentUid}_${lessonId}`;
    await setDoc(
      doc(db, 'attendance', recId),
      {
        id: recId,
        studentUid,
        lessonId,
        attended: record.attended || null,
        opened: record.opened || null,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save attendance to cloud:', error);
  }
}

export async function saveQuizResultToCloud(
  studentUid: string,
  quizId: string,
  result: QuizResult
): Promise<void> {
  try {
    const recId = `${studentUid}_${quizId}`;
    await setDoc(
      doc(db, 'quiz_results', recId),
      {
        id: recId,
        studentUid,
        quizId,
        score: result.score,
        total: result.total,
        best: result.best,
        at: result.at || Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save quiz result to cloud:', error);
  }
}

export async function saveCertificateToCloud(certificate: Certificate): Promise<void> {
  try {
    await setDoc(doc(db, 'certificates', certificate.id), certificate, { merge: true });
  } catch (error) {
    console.error('Failed to save certificate to cloud:', error);
  }
}

export async function saveResourceToCloud(resource: ResourceFile): Promise<void> {
  try {
    const cleanRes = { ...resource };
    // If it's a data url or image, ensure it is compressed
    if (cleanRes.fileUrl && cleanRes.fileUrl.startsWith('data:image')) {
      cleanRes.fileUrl = await compressImage(cleanRes.fileUrl, 1200, 900, 0.78);
    }
    await setDoc(doc(db, 'resources', resource.id), cleanRes, { merge: true });
  } catch (error) {
    console.error('Failed to save resource file to cloud:', error);
  }
}

export async function deleteResourceFromCloud(resourceId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'resources', resourceId));
  } catch (error) {
    console.error('Failed to delete resource file from cloud:', error);
  }
}

export async function incrementResourceDownloadInCloud(resourceId: string): Promise<void> {
  try {
    const resRef = doc(db, 'resources', resourceId);
    const snap = await getDoc(resRef);
    if (snap.exists()) {
      const cur = snap.data().downloadCount || 0;
      await updateDoc(resRef, { downloadCount: cur + 1 });
    }
  } catch (error) {
    console.warn('Failed to update download count in cloud:', error);
  }
}

export async function saveLessonCommentToCloud(comment: LessonComment): Promise<void> {
  try {
    await setDoc(doc(db, 'lesson_comments', comment.id), comment, { merge: true });
  } catch (error) {
    console.error('Failed to save lesson comment to cloud:', error);
  }
}

export async function deleteLessonCommentFromCloud(commentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lesson_comments', commentId));
  } catch (error) {
    console.error('Failed to delete lesson comment from cloud:', error);
  }
}

export async function likeLessonCommentInCloud(commentId: string): Promise<void> {
  try {
    const commRef = doc(db, 'lesson_comments', commentId);
    const snap = await getDoc(commRef);
    if (snap.exists()) {
      const cur = snap.data().likes || 0;
      await updateDoc(commRef, { likes: cur + 1 });
    }
  } catch (error) {
    console.warn('Failed to update comment likes in cloud:', error);
  }
}

