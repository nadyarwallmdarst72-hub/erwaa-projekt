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

  const tabs: { key: MainTabKey; label: string; shortLabel: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'cal', label: labels.cal || 'لوحتي', shortLabel: 'لوحتي', icon: <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { key: 'courses', label: labels.courses || 'المقررات والمواد', shortLabel: 'المقررات', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> },
    {
      key: 'questions',
      label: labels.questions || 'الأسئلة العلمية',
      shortLabel: 'الأسئلة',
      icon: <MessageSquareQuote className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
    { key: 'quiz', label: labels.quiz || 'الاختبارات', shortLabel: 'الاختبارات', icon: <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { key: 'certs', label: labels.certs || 'الشهادات', shortLabel: 'الشهادات', icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" /> },
    {
      key: 'projects',
      label: labels.projects || 'المشاريع',
      shortLabel: 'المشاريع',
      icon: <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />,
    },
  ];

  if (isStaff) {
    tabs.push({
      key: 'admin',
      label: 'الإدارة',
      shortLabel: 'الإدارة',
      icon: <Settings className="w-4 h-4 sm:w-5 sm:h-5" />,
      badge: pendingProjectsCount > 0 ? pendingProjectsCount : undefined,
    });
  }

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] shadow-xl transition-all"
      style={{
        paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
        paddingTop: '4px',
      }}
      aria-label="شريط التنقل الرئيسي"
    >
      <div className="max-w-4xl mx-auto px-1 sm:px-3 flex items-center justify-around gap-0.5 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`relative flex-1 max-w-[120px] flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-soft)]/50'
              }`}
              style={{
                color: isActive ? 'var(--accent)' : undefined,
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.1 rounded-full min-w-[15px] text-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 sm:mt-1 truncate max-w-full font-body">
                <span className="inline sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
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
