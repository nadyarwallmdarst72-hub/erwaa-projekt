import React, { useState, useMemo } from 'react';
import {
  Student,
  UserAccount,
  QuizResult,
  AttendanceRecord,
  Lesson,
  Quiz,
  Certificate,
  Role,
} from '../types';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  TrendingUp,
  Calendar,
  HelpCircle,
  Sparkles,
  Flame,
  CheckCircle2,
  GraduationCap,
  Star,
  Users,
} from 'lucide-react';

interface LeaderboardViewProps {
  students: Student[];
  users: UserAccount[];
  quizResults: Record<string, Record<string, QuizResult>>;
  attendance: Record<string, Record<string, AttendanceRecord>>;
  lessons: Lesson[];
  quizzes: Quiz[];
  certificates: Certificate[];
  currentUser: UserAccount | null;
}

type SortCriteria = 'points' | 'attendance' | 'certs';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  users,
  quizResults,
  attendance,
  lessons,
  quizzes,
  certificates,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortCriteria>('points');

  // Compute stats for all students
  const leaderboardData = useMemo(() => {
    // Merge students & users with student role
    const studentMap = new Map<string, { id: string; name: string; email?: string }>();
    students.forEach((s) => {
      studentMap.set(s.id, { id: s.id, name: s.name, email: s.email });
    });
    users
      .filter((u) => u.role === 'student' || u.role === 'owner')
      .forEach((u) => {
        if (!studentMap.has(u.id)) {
          studentMap.set(u.id, { id: u.id, name: u.name, email: u.email });
        }
      });

    const totalLessonsCount = lessons.length;

    return Array.from(studentMap.values()).map((student) => {
      // 1. Quizzes Stats
      const userQuizzes = quizResults[student.id] || {};
      let totalScore = 0;
      let totalPossible = 0;
      let attemptedCount = 0;

      Object.values(userQuizzes).forEach((res) => {
        if (res && res.total > 0) {
          totalScore += res.best || res.score || 0;
          totalPossible += res.total;
          attemptedCount++;
        }
      });

      const avgQuizPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      // Points formula: totalScore * 10 + bonus for high percentage
      const totalPoints = totalScore * 15 + Math.round(avgQuizPct * 2.5);

      // 2. Attendance Stats
      const userAtt = attendance[student.id] || {};
      const attendedLessons = lessons.filter((l) => userAtt[l.id]?.attended).length;
      const attendancePct = totalLessonsCount > 0 ? Math.round((attendedLessons * 100) / totalLessonsCount) : 0;

      // 3. Certificates Count
      const studentCerts = certificates.filter((c) => c.uid === student.id).length;

      // Overall honor rating
      const honorScore = totalPoints + attendancePct * 3 + studentCerts * 50;

      return {
        id: student.id,
        name: student.name || 'طالب متميز',
        email: student.email,
        totalPoints,
        totalScore,
        avgQuizPct,
        attemptedCount,
        attendedLessons,
        attendancePct,
        studentCerts,
        honorScore,
      };
    });
  }, [students, users, quizResults, attendance, lessons, certificates]);

  // Sort and filter
  const sortedLeaderboard = useMemo(() => {
    let list = [...leaderboardData];

    if (sortBy === 'points') {
      list.sort((a, b) => b.totalPoints - a.totalPoints || b.avgQuizPct - a.avgQuizPct);
    } else if (sortBy === 'attendance') {
      list.sort((a, b) => b.attendancePct - a.attendancePct || b.totalPoints - a.totalPoints);
    } else if (sortBy === 'certs') {
      list.sort((a, b) => b.studentCerts - a.studentCerts || b.totalPoints - a.totalPoints);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || (s.email && s.email.toLowerCase().includes(q))
      );
    }

    return list;
  }, [leaderboardData, sortBy, searchQuery]);

  const topThree = sortedLeaderboard.slice(0, 3);
  const remainingStudents = sortedLeaderboard.slice(3);

  return (
    <div className="grid gap-6 animate-fade-in pb-10">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-[var(--surface)] to-[var(--surface)] border border-[var(--line)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-300/40">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>لوحة الشرف وتكريم المتفوقين</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold font-display text-[var(--fg)] m-0">
              قائمة الشرف والترتيب الأكاديمي
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] m-0 mt-1 max-w-2xl leading-relaxed">
              تكريم الطلاب الأكثر تفاعلاً والتزاماً بحضور المحاضرات وحصداً لأعلى درجات الاختبارات في المنصة.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center gap-2 bg-[var(--surface)] p-2.5 rounded-2xl border border-[var(--line)] shadow-xs">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold block text-[var(--fg)]">تنافس علمي شريف</span>
              <span className="text-[11px] text-[var(--muted)]">محدّث لحظياً من الاختبارات والحضور</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting & Search Controls */}
      <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-xs font-semibold w-full md:w-auto">
          <button
            type="button"
            onClick={() => setSortBy('points')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl transition-all ${
              sortBy === 'points'
                ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            الأعلى في نقاط الاختبارات
          </button>
          <button
            type="button"
            onClick={() => setSortBy('attendance')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl transition-all ${
              sortBy === 'attendance'
                ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            الأعلى في الحضور والالتزام
          </button>
          <button
            type="button"
            onClick={() => setSortBy('certs')}
            className={`flex-1 md:flex-initial px-3.5 py-1.5 rounded-xl transition-all ${
              sortBy === 'certs'
                ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--fg)]'
            }`}
          >
            الأكثر شهادات
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[var(--muted)] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن اسم الطالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pr-10 pl-3.5 py-2 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* Top 3 Podium (منصة التتويج) */}
      {!searchQuery && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4 pb-2">
          {/* Second Place (🥈) */}
          <div className="order-2 md:order-1 p-5 rounded-3xl bg-[var(--surface)] border border-slate-300 dark:border-slate-700 shadow-md flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1 transition-all">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-400" />
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xl mb-2 relative">
              🥈
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-500 text-white text-[10px] font-bold">
                #2
              </span>
            </div>
            <h3 className="font-bold text-base text-[var(--fg)] font-display m-0">
              {topThree[1].name}
            </h3>
            <span className="text-xs text-[var(--muted)] mt-0.5">المركز الثاني</span>
            <div className="mt-3 py-2 px-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] w-full grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-600 dark:text-slate-300 block text-sm font-display">
                  {topThree[1].totalPoints}
                </span>
                <span className="text-[10px] text-[var(--muted)]">نقطة تقييم</span>
              </div>
              <div>
                <span className="font-bold text-[var(--accent)] block text-sm font-display">
                  {topThree[1].attendancePct}%
                </span>
                <span className="text-[10px] text-[var(--muted)]">نسبة الحضور</span>
              </div>
            </div>
          </div>

          {/* First Place (🥇 - The Champion) */}
          <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-[var(--surface)] to-[var(--surface)] border-2 border-amber-400 dark:border-amber-600 shadow-xl flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-3 hover:-translate-y-4 transition-all">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />
            <div className="w-18 h-18 rounded-full bg-amber-100 dark:bg-amber-950/80 border-4 border-amber-400 flex items-center justify-center text-amber-700 dark:text-amber-200 font-bold text-3xl mb-2 relative shadow-lg">
              <Crown className="w-6 h-6 text-amber-500 absolute -top-3" />
              🥇
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-sm">
                #1
              </span>
            </div>
            <h3 className="font-extrabold text-lg sm:text-xl text-[var(--fg)] font-display m-0 flex items-center gap-1.5">
              <span>{topThree[0].name}</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </h3>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              فارس المنصة والمركز الأول
            </span>

            <div className="mt-4 py-2.5 px-4 rounded-2xl bg-amber-500/10 border border-amber-300/40 w-full grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-black text-amber-700 dark:text-amber-300 block text-base font-display">
                  {topThree[0].totalPoints}
                </span>
                <span className="text-[10px] text-[var(--muted)]">مجموع النقاط</span>
              </div>
              <div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 block text-base font-display">
                  {topThree[0].attendancePct}%
                </span>
                <span className="text-[10px] text-[var(--muted)]">نسبة الحضور</span>
              </div>
            </div>
          </div>

          {/* Third Place (🥉) */}
          <div className="order-3 md:order-3 p-5 rounded-3xl bg-[var(--surface)] border border-amber-700/30 shadow-md flex flex-col items-center text-center relative overflow-hidden transform hover:-translate-y-1 transition-all">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-700" />
            <div className="w-14 h-14 rounded-full bg-amber-900/10 border-2 border-amber-700/40 flex items-center justify-center text-amber-800 dark:text-amber-300 font-bold text-xl mb-2 relative">
              🥉
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[10px] font-bold">
                #3
              </span>
            </div>
            <h3 className="font-bold text-base text-[var(--fg)] font-display m-0">
              {topThree[2].name}
            </h3>
            <span className="text-xs text-[var(--muted)] mt-0.5">المركز الثالث</span>
            <div className="mt-3 py-2 px-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] w-full grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold text-amber-800 dark:text-amber-300 block text-sm font-display">
                  {topThree[2].totalPoints}
                </span>
                <span className="text-[10px] text-[var(--muted)]">نقطة تقييم</span>
              </div>
              <div>
                <span className="font-bold text-[var(--accent)] block text-sm font-display">
                  {topThree[2].attendancePct}%
                </span>
                <span className="text-[10px] text-[var(--muted)]">نسبة الحضور</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <h3 className="font-bold text-base font-display text-[var(--fg)] m-0 flex items-center gap-2">
            <Medal className="w-5 h-5 text-amber-500" />
            <span>ترتيب الطلاب المتفوقين</span>
          </h3>
          <span className="text-xs text-[var(--muted)] font-semibold">
            إجمالي الطلاب المشاركين: {sortedLeaderboard.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--accent-soft)]/20 text-[var(--muted)] font-semibold">
                <th className="p-3.5 text-center w-14">الترتيب</th>
                <th className="p-3.5">اسم الطالب</th>
                <th className="p-3.5 text-center">نقاط الاختبارات</th>
                <th className="p-3.5 text-center">نسبة الحضور</th>
                <th className="p-3.5 text-center">معدل الاختبارات</th>
                <th className="p-3.5 text-center">الشهادات</th>
                <th className="p-3.5">وسام التميز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {sortedLeaderboard.map((stu, index) => {
                const rank = index + 1;
                const isMe = currentUser && currentUser.id === stu.id;

                let rankBadge = (
                  <span className="font-mono font-bold text-xs text-[var(--muted)]">
                    #{rank}
                  </span>
                );
                if (rank === 1) rankBadge = <span className="text-base">🥇</span>;
                if (rank === 2) rankBadge = <span className="text-base">🥈</span>;
                if (rank === 3) rankBadge = <span className="text-base">🥉</span>;

                return (
                  <tr
                    key={stu.id}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-[var(--accent-soft)]/40 font-bold'
                        : 'hover:bg-[var(--accent-soft)]/20'
                    }`}
                  >
                    <td className="p-3.5 text-center font-bold">{rankBadge}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-teal-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {stu.name.charAt(0) || 'ط'}
                        </div>
                        <div>
                          <span className="font-bold text-[var(--fg)] block">
                            {stu.name}
                            {isMe && (
                              <span className="mr-1.5 px-2 py-0.2 rounded-full text-[10px] bg-[var(--accent)] text-white">
                                أنت
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-[var(--muted)] font-normal">
                            {stu.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-extrabold text-sm text-purple-600 dark:text-purple-400">
                        {stu.totalPoints}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono font-bold">{stu.attendancePct}%</span>
                        <div className="w-12 h-1.5 rounded-full bg-[var(--line)] overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stu.attendancePct}%`,
                              backgroundColor:
                                stu.attendancePct >= 80 ? 'var(--accent)' : '#f59e0b',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-[var(--fg)]">
                      {stu.avgQuizPct}%
                    </td>
                    <td className="p-3.5 text-center">
                      {stu.studentCerts > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <Award className="w-3.5 h-3.5" />
                          <span>{stu.studentCerts}</span>
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {rank === 1 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                          فارس الأكاديمية الأول
                        </span>
                      ) : rank <= 3 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                          لوحة الشرف الذهبية
                        </span>
                      ) : stu.attendancePct >= 80 && stu.avgQuizPct >= 75 ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300">
                          طالب مجتهد ومتفوق
                        </span>
                      ) : (
                        <span className="text-[var(--muted)] text-[11px]">مشارك نشط</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
