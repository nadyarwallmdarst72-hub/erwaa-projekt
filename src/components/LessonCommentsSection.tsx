import React, { useState } from 'react';
import { LessonComment, UserAccount, Role } from '../types';
import { formatDateTime } from '../storage';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  GraduationCap,
  Heart,
  Trash2,
  Reply,
  CheckCircle2,
  Lock,
  Sparkles,
  User,
  CornerDownLeft,
} from 'lucide-react';

interface LessonCommentsSectionProps {
  lessonId: string;
  lessonTitle: string;
  comments: LessonComment[];
  currentUser: UserAccount | null;
  onAddComment: (comment: Omit<LessonComment, 'id' | 'createdAt'>) => void;
  onDeleteComment: (commentId: string) => void;
  onLikeComment: (commentId: string) => void;
  onOpenAuthModal: () => void;
}

export const LessonCommentsSection: React.FC<LessonCommentsSectionProps> = ({
  lessonId,
  lessonTitle,
  comments,
  currentUser,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  onOpenAuthModal,
}) => {
  const [content, setContent] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<LessonComment | null>(null);

  const isStaff = currentUser?.role === 'owner' || currentUser?.role === 'teacher';

  const lessonComments = comments
    .filter((c) => c.lessonId === lessonId)
    .sort((a, b) => a.createdAt - b.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (!content.trim()) return;

    onAddComment({
      lessonId,
      uid: currentUser.id,
      authorName: currentUser.name || 'عضو في المنصة',
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      isStaffReply: isStaff,
      replyToId: replyingToComment ? replyingToComment.id : undefined,
      likes: 0,
    });

    setContent('');
    setReplyingToComment(null);
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:p-5 grid gap-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm font-display text-[var(--fg)] m-0">
              نقاشات واستفسارات الدرس
            </h4>
            <span className="text-[11px] text-[var(--muted)]">
              {lessonComments.length} {lessonComments.length === 1 ? 'تعليق وسؤال' : 'تعليقات ومشاركات'}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          محادثة حية ومباشرة
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {lessonComments.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--line)] rounded-xl bg-[var(--bg)]/40">
            لا توجد استفسارات حول هذا الدرس حتى الآن. كن أول من يطرح سؤاله أو يشارك رأيه!
          </div>
        ) : (
          lessonComments.map((comment) => {
            const isOwnerOrTeacher = comment.authorRole === 'owner' || comment.authorRole === 'teacher';
            const isMyComment = currentUser && currentUser.id === comment.uid;
            const canDelete = isMyComment || isStaff;

            return (
              <div
                key={comment.id}
                className={`p-3 rounded-2xl border transition-all text-xs grid gap-1.5 ${
                  comment.isStaffReply || isOwnerOrTeacher
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : 'bg-[var(--bg)] border-[var(--line)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {comment.authorName.charAt(0) || 'م'}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[var(--fg)]">
                        {comment.authorName}
                      </span>

                      {/* Staff Badge */}
                      {(comment.isStaffReply || isOwnerOrTeacher) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold border border-emerald-300 dark:border-emerald-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>رد الإدارة المعتمد</span>
                        </span>
                      )}

                      {comment.replyToId && (
                        <span className="text-[10px] text-[var(--muted)] flex items-center gap-0.5">
                          <CornerDownLeft className="w-2.5 h-2.5" />
                          <span>رد على استفسار</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--muted)]">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-[var(--fg)] m-0 leading-relaxed whitespace-pre-line pt-0.5">
                  {comment.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]/50 mt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onLikeComment(comment.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-rose-500 transition-colors"
                      title="أعجبني هذا التعليق"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          (comment.likes || 0) > 0 ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      <span>{comment.likes || 0}</span>
                    </button>

                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToComment(comment);
                          setContent(`@${comment.authorName} `);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>رد</span>
                      </button>
                    )}
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment.id)}
                      className="text-rose-500 hover:text-rose-700 p-0.5 text-[10px] font-semibold"
                      title="حذف هذا التعليق"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="grid gap-2 pt-1 border-t border-[var(--line)]">
          {replyingToComment && (
            <div className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] font-semibold">
              <span>ترد حالياً على: {replyingToComment.authorName}</span>
              <button
                type="button"
                onClick={() => setReplyingToComment(null)}
                className="text-[var(--muted)] hover:text-[var(--fg)] text-xs"
              >
                إلغاء الرد
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <textarea
              rows={2}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isStaff
                  ? 'اكتب ردك الأكاديمي أو التوجيه الرسمي للطلاب هنا...'
                  : 'اكتب سؤالك أو استفسارك حول هذا الدرس...'
              }
              className="flex-1 text-xs px-3.5 py-2.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] leading-relaxed resize-none"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-white shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5 self-stretch transition-transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-center text-xs text-[var(--muted)] flex items-center justify-between gap-2">
          <span>سجّل دخولك لتتمكن من كتابة استفسارك والمشاركة في نقاش الدرس.</span>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs flex-shrink-0"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            تسجيل الدخول
          </button>
        </div>
      )}
    </div>
  );
};
