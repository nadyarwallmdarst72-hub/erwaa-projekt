import React from 'react';
import { SiteSettings, UserAccount, OWNER_EMAIL } from '../types';
import { ShieldCheck, UserCheck, GraduationCap, Moon, Sun, LogIn, LogOut, Clock, Bell, UserCog } from 'lucide-react';

interface HeaderProps {
  site: SiteSettings;
  currentUser: UserAccount | null;
  unreadNotificationsCount: number;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onOpenEditProfile: () => void;
  onLogout: () => void;
  darkTheme: boolean;
  onToggleTheme: () => void;
  cloudStatus?: 'connected' | 'syncing' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  site,
  currentUser,
  unreadNotificationsCount,
  onOpenAuthModal,
  onOpenNotifications,
  onOpenEditProfile,
  onLogout,
  darkTheme,
  onToggleTheme,
  cloudStatus = 'connected',
}) => {
  const isOwner = currentUser?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  return (
    <header className="flex items-center justify-between gap-3 py-2 px-1 border-b border-[var(--line)] pb-3 mb-2">
      {/* Brand */}
      <div className="flex items-center gap-2.5 min-w-0">
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
            className="font-bold text-lg sm:text-xl leading-tight truncate font-display"
            style={{ color: 'var(--accent)' }}
          >
            {site.name || 'إرواء'}
          </h1>
          {site.tagline && (
            <p className="text-[11px] text-[var(--muted)] truncate m-0 font-body">
              {site.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Cloud Sync Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-xl text-[10px] font-semibold border ${
            cloudStatus === 'connected'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : cloudStatus === 'syncing'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
          title="قاعدة بيانات سحابية موحدة ومتزامنة لحظياً (Firestore)"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cloudStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : cloudStatus === 'syncing'
                ? 'bg-blue-500 animate-ping'
                : 'bg-amber-500'
            }`}
          />
          <span className="hidden sm:inline">
            {cloudStatus === 'connected'
              ? 'سحابة متصلة'
              : cloudStatus === 'syncing'
              ? 'مزامنة...'
              : 'سحابي'}
          </span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          title="التنبيهات والإعلانات"
          aria-label="مركز الإشعارات"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[17px] text-center shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Account or Login Button */}
        {currentUser ? (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-2 p-1 pe-2 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--fg)] shadow-xs">
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="relative group rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                title="تعديل بيانات الحساب والملف الشخصي"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover bg-white"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {currentUser.name ? currentUser.name.slice(0, 1) : 'م'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <UserCog className="w-3.5 h-3.5" />
                </div>
              </button>

              <div className="text-right min-w-0 hidden sm:block">
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  className="block text-xs font-bold leading-tight truncate max-w-[105px] text-right hover:text-[var(--accent)] transition-colors"
                >
                  {currentUser.name || currentUser.email.split('@')[0]}
                </button>
                <span className="text-[10px] text-[var(--muted)] leading-none flex items-center gap-1">
                  {isOwner ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      المالك (أحمد)
                    </span>
                  ) : currentUser.role === 'teacher' ? (
                    <span className="text-blue-600 font-bold flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3" />
                      معلم مشرف
                    </span>
                  ) : currentUser.status === 'pending' ? (
                    <span className="text-amber-600 font-bold flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      قيد المراجعة
                    </span>
                  ) : (
                    <span className="text-teal-600 font-bold flex items-center gap-0.5">
                      <GraduationCap className="w-3 h-3" />
                      طالب
                    </span>
                  )}
                </span>
              </div>

              {/* Edit Account Icon */}
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                title="تعديل الحساب"
              >
                <UserCog className="w-3.5 h-3.5" />
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1 rounded-full text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="تسجيل الخروج"
                aria-label="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تسجيل الدخول / حساب جديد</span>
            <span className="sm:hidden">دخول</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          title={darkTheme ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          aria-label="تبديل المظهر"
        >
          {darkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
