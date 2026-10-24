import React from 'react';
import { NotificationItem } from '../types';
import { formatDateTime } from '../storage';
import { Bell, Check, Trash2, X, ExternalLink, Megaphone, HelpCircle, Award, BookOpen } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUid?: string;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUid,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  // Filter notifications for this user or all
  const userNotifications = notifications.filter(
    (n) => !n.targetUid || n.targetUid === currentUid
  );

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-blue-500" />;
      case 'cert':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'lesson':
        return <BookOpen className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--accent)]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-[460px] bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 shadow-2xl animate-slide-up grid gap-3 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-[var(--accent)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                مركز الإشعارات والتنبيهات
              </h3>
              <p className="text-[11px] text-[var(--muted)] m-0">
                {unreadCount > 0
                  ? `لديك ${unreadCount} إشعار غير مقروء`
                  : 'كافة الإشعارات مقروءة ومحدثة'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-[var(--accent)] hover:underline px-2 py-1 rounded"
              >
                تحديد الكل كمقروء
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="overflow-y-auto divide-y divide-[var(--line)] pr-1">
          {userNotifications.length > 0 ? (
            userNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) onMarkAsRead(notif.id);
                  if (notif.linkTab) {
                    onNavigateTab(notif.linkTab);
                    onClose();
                  }
                }}
                className={`py-3 px-2 flex items-start justify-between gap-3 rounded-xl transition-colors cursor-pointer group ${
                  notif.read
                    ? 'hover:bg-[var(--accent-soft)]/20 opacity-80'
                    : 'bg-[var(--accent-soft)]/40 hover:bg-[var(--accent-soft)]/60'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-white dark:bg-black/30 border border-[var(--line)] flex-shrink-0 mt-0.5 shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-[var(--fg)] m-0 truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] m-0 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[var(--muted)] block mt-1">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notif.id);
                    }}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="حذف الإشعار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-[var(--muted)]">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="m-0">لا توجد إشعارات جديدة في صندوقك.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
