import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from '../firebase';
import { UserAccount, Announcement, ScientificQuestion, UserStatus, Role } from '../types';
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

    // 1. Synchronize Users Collection in Real Time
    const usersCol = collection(db, 'users');

    // First check if cloud users is empty, if so, seed initial users from local storage
    try {
      const existingSnap = await getDocs(usersCol);
      if (existingSnap.empty) {
        const localSnapshot = appStorage.getSnapshot();
        for (const u of localSnapshot.users) {
          await setDoc(doc(db, 'users', u.id), u);
        }
      }
    } catch (e) {
      console.warn('Initial seed check error:', e);
    }

    // Real-time listener for users / admissions
    onSnapshot(
      usersCol,
      (snapshot) => {
        const cloudUsers: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          cloudUsers.push(docSnap.data() as UserAccount);
        });

        if (cloudUsers.length > 0) {
          appStorage.mergeCloudUsers(cloudUsers);
        }
        onStatusChange?.('connected');
      },
      (error) => {
        onStatusChange?.('error');
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    // 2. Synchronize Announcements Collection in Real Time
    const announcementsCol = collection(db, 'announcements');
    onSnapshot(
      announcementsCol,
      (snapshot) => {
        const cloudAnnouncements: Announcement[] = [];
        snapshot.forEach((docSnap) => {
          cloudAnnouncements.push(docSnap.data() as Announcement);
        });

        if (cloudAnnouncements.length > 0) {
          appStorage.mergeCloudAnnouncements(cloudAnnouncements);
        }
      },
      (error) => {
        console.warn('Announcements sync error:', error);
      }
    );

    // 3. Synchronize Scientific Questions in Real Time
    const questionsCol = collection(db, 'questions');
    onSnapshot(
      questionsCol,
      (snapshot) => {
        const cloudQuestions: ScientificQuestion[] = [];
        snapshot.forEach((docSnap) => {
          cloudQuestions.push(docSnap.data() as ScientificQuestion);
        });

        if (cloudQuestions.length > 0) {
          appStorage.mergeCloudQuestions(cloudQuestions);
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

// Cloud Mutation Operations
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
