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

export interface Course {
  id: string;
  title: string;
  desc?: string;
  teacher?: string;
  minAtt?: number;
  minScore?: number;
  createdAt?: number;
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

export type Role = 'owner' | 'teacher' | 'student';
