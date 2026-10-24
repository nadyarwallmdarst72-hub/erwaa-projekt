export const OWNER_EMAIL = 'nadyarwallmdarst72@gmail.com';

export type UserStatus = 'active' | 'pending' | 'suspended';

export type Role = 'owner' | 'teacher' | 'student';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  joinedAt: number;
  lastLoginAt?: number;
  bio?: string;
  avatar?: string;
  phone?: string;
}

export interface VerificationCode {
  email: string;
  code: string;
  expiresAt: number;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'review' | 'cert' | 'admission' | 'lesson' | 'question';
  createdAt: number;
  read: boolean;
  targetUid?: string; // empty means all users
  linkTab?: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'link' | 'video' | 'archive';
  url: string;
  size?: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  desc?: string;
  teacher?: string;
  minAtt?: number;
  minScore?: number;
  createdAt?: number;
  type?: 'course' | 'subject'; // 'course' = دورة تدريبية, 'subject' = مادة دراسية
  category?: string;
  materials?: CourseMaterial[];
}

export interface ScientificAnswer {
  id: string;
  questionId: string;
  uid: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: number;
  isVerified: boolean;
  likes: number;
}

export interface ScientificQuestion {
  id: string;
  uid: string;
  authorName: string;
  courseId?: string;
  courseTitle?: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: number;
  answers: ScientificAnswer[];
  status: 'open' | 'resolved';
}

export interface CertLayoutElement {
  on: boolean;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  size: number;
  color?: string;
}

export interface CertLayout {
  brand: CertLayoutElement;
  title: CertLayoutElement;
  pre: CertLayoutElement;
  name: CertLayoutElement;
  body: CertLayoutElement;
  date: CertLayoutElement;
  serial: CertLayoutElement;
  signer: CertLayoutElement;
}

export interface SiteSettings {
  name: string;
  tagline: string;
  logo: string;
  accent: string;
  fontBody: string;
  fontHead: string;
  welcomeTitle: string;
  welcomeText: string;
  footer: string;
  labels: {
    cal: string;
    courses: string;
    quiz: string;
    certs: string;
    projects: string;
    questions?: string;
  };
  cert: {
    title: string;
    pre: string;
    body: string;
    signer: string;
    role: string;
    layout: CertLayout;
  };
}

export interface Lesson {
  id: string;
  title: string;
  courseId: string;
  course?: string;
  date: string; // YYYY-MM-DD
  url?: string;
  createdAt?: number;
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseId?: string;
  minutes?: number; // 0 for unlimited
  opensAt?: number;
  closesAt?: number;
  single?: boolean;
  questions: Question[];
  createdAt?: number;
}

export interface Announcement {
  id: string;
  title: string;
  text?: string;
  linkLabel?: string;
  linkUrl?: string;
  courseId?: string; // empty means all students
  createdAt?: number;
}

export interface Student {
  id: string;
  name: string;
  joinedAt?: number;
  email?: string;
}

export interface Teacher {
  id: string;
  name?: string;
  courses: string[];
  at?: number;
}

export interface AttendanceRecord {
  opened?: number | null;
  attended?: number | null;
}

export interface QuizResult {
  score: number;
  total: number;
  best: number;
  at: number;
}

export interface QuizAttempt {
  startedAt: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  uid: string;
  issuedAt: number;
  serial: string;
}

export interface Project {
  id: string;
  uid: string;
  title: string;
  text?: string;
  link?: string;
  courseId: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProjectReview {
  status: 'submitted' | 'returned' | 'reviewed';
  grade?: string;
  feedback?: string;
  at: number;
  by: string;
}
