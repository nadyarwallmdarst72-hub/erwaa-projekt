import React from 'react';
import { SiteSettings, Role } from '../types';
import { ShieldCheck, UserCheck, GraduationCap, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  site: SiteSettings;
  currentRole: Role;
  onRoleChange: (newRole: Role) => void;
  darkTheme: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  site,
  currentRole,
  onRoleChange,
  darkTheme,
  onToggleTheme,
}) => {
  return (
    <header className="flex items-center justify-between gap-3 py-2 px-1 border-b border-[var(--line)] pb-3 mb-2">
      <div className="flex items-center gap-3 min-w-0">
        {site.logo ? (
          <img
            src={site.logo}
            alt={site.name}
            className="h-10 max-w-[120px] object-contain rounded-md"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm"
            style={{
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            {site.name ? site.name.slice(0, 2) : 'إر'}
          </div>
        )}
        <div className="min-w-0">
          <h1
            className="font-bold text-xl leading-tight truncate font-display"
            style={{ color: 'var(--accent)' }}
          >
            {site.name || 'إرواء'}
          </h1>
          {site.tagline && (
            <p className="text-xs text-[var(--muted)] truncate m-0 font-body">
              {site.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Role Switcher */}
        <div className="relative inline-flex items-center">
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as Role)}
            className="appearance-none text-xs font-semibold px-2.5 py-1.5 pe-7 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            title="تبديل المنظور الحالي للتجربة"
          >
            <option value="student">🎓 طالب</option>
            <option value="teacher">👨‍🏫 معلم مشرف</option>
            <option value="owner">👑 مدير المنصة</option>
          </select>
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {currentRole === 'owner' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
            {currentRole === 'teacher' && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
            {currentRole === 'student' && <GraduationCap className="w-3.5 h-3.5 text-teal-600" />}
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          title={darkTheme ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          aria-label="تبديل المظهر"
        >
          {darkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
