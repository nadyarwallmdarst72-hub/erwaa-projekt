import React from 'react';
import { SiteSettings, Role } from '../types';
import {
  CalendarDays,
  BookOpen,
  HelpCircle,
  Award,
  FolderKanban,
  Settings,
  MessageSquareQuote,
} from 'lucide-react';

export type MainTabKey =
  | 'cal'
  | 'courses'
  | 'questions'
  | 'quiz'
  | 'certs'
  | 'projects'
  | 'admin';

interface TabsNavProps {
  site: SiteSettings;
  currentTab: MainTabKey;
  onTabChange: (tab: MainTabKey) => void;
  role: Role;
  pendingProjectsCount?: number;
  unansweredQuestionsCount?: number;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  site,
  currentTab,
  onTabChange,
  role,
  pendingProjectsCount = 0,
}) => {
  const isStaff = role === 'owner' || role === 'teacher';
  const labels = site.labels || {
    cal: 'لوحتي',
    courses: 'المقررات',
    questions: 'الأسئلة',
    quiz: 'الاختبارات',
    certs: 'الشهادات',
    projects: 'المشاريع',
  };

  const tabs: { key: MainTabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'cal', label: labels.cal, icon: <CalendarDays className="w-5 h-5" /> },
    { key: 'courses', label: labels.courses || 'الدورات والمواد', icon: <BookOpen className="w-5 h-5" /> },
    {
      key: 'questions',
      label: labels.questions || 'الأسئلة العلمية',
      icon: <MessageSquareQuote className="w-5 h-5" />,
    },
    { key: 'quiz', label: labels.quiz, icon: <HelpCircle className="w-5 h-5" /> },
    { key: 'certs', label: labels.certs, icon: <Award className="w-5 h-5" /> },
    {
      key: 'projects',
      label: labels.projects,
      icon: <FolderKanban className="w-5 h-5" />,
    },
  ];

  if (isStaff) {
    tabs.push({
      key: 'admin',
      label: 'الإدارة',
      icon: <Settings className="w-5 h-5" />,
      badge: pendingProjectsCount > 0 ? pendingProjectsCount : undefined,
    });
  }

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-30 bg-[var(--surface)] border-t border-[var(--line)] shadow-lg"
      style={{
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
        paddingTop: '6px',
      }}
      aria-label="شريط التنقل الرئيسي"
    >
      <div className="max-w-[560px] mx-auto px-1 grid grid-flow-col auto-cols-fr gap-0.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all ${
                isActive
                  ? 'font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-soft)]/40'
              }`}
              style={{
                color: isActive ? 'var(--accent)' : undefined,
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-1 truncate max-w-full font-body">
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full mt-0.5"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
