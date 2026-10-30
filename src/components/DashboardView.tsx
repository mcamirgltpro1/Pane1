import React from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  Bell, 
  BookOpen, 
  Sparkles, 
  Flame, 
  Check, 
  Calendar as CalendarIcon, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppState, ScheduleActivity, TaskItem } from '../types';
import { translations, toPersianDigits } from '../utils/translations';
import { calculateBacklog } from '../utils/backlog';
import { playChime, triggerVibration } from '../utils/audio';

interface DashboardViewProps {
  state: AppState;
  onUpdateTask: (task: TaskItem) => void;
  onUpdateActivity: (activity: ScheduleActivity) => void;
  onIncrementLesson: (courseId: string) => void;
  onNavigateToTab: (tab: 'dashboard' | 'schedule' | 'tasks' | 'learning' | 'reports' | 'settings') => void;
  onOpenQuickAdd: (type: 'task' | 'reminder' | 'activity' | 'session') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onUpdateTask,
  onUpdateActivity,
  onIncrementLesson,
  onNavigateToTab,
  onOpenQuickAdd,
}) => {
  const t = translations[state.language];

  // Determine current day of week (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
  // JS getDay(): 0 = Sun, 1 = Mon, ..., 6 = Sat
  const jsDay = new Date().getDay();
  const plannerDay = jsDay === 6 ? 0 : jsDay + 1; // 6(Sat)->0, 0(Sun)->1, 1(Mon)->2, ..., 5(Fri)->6

  // Today's activities
  const todayActivities = state.scheduleActivities.filter((a) => a.dayOfWeek === plannerDay);
  const completedTodayActs = todayActivities.filter((a) => a.status === 'completed').length;

  // Today's tasks
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter((t) => t.dueDate === todayDateStr || t.priority === 'urgent');
  const pendingTasks = todayTasks.filter((t) => t.status === 'pending');
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed').length;

  // Daily Completion Percentage
  const totalItems = todayActivities.length + todayTasks.length;
  const completedItems = completedTodayActs + completedTodayTasks;
  const dailyPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;

  // Courses
  const aiCourse = state.courses.find((c) => c.id === 'course-ai-python') || state.courses[0];
  const mathCourse = state.courses.find((c) => c.id === 'course-math-techno-sharif') || state.courses[1];
  const aiBacklog = aiCourse ? calculateBacklog(aiCourse) : null;
  const mathBacklog = mathCourse ? calculateBacklog(mathCourse) : null;

  // Electronics total stats
  const totalElecMinutes = state.electronicsResources.reduce((acc, r) => acc + r.studyMinutesLogged, 0);

  const handleCompleteTask = (task: TaskItem) => {
    playChime('complete');
    triggerVibration([50]);
    onUpdateTask({
      ...task,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  };

  const handleCompleteActivity = (act: ScheduleActivity) => {
    playChime('complete');
    triggerVibration([50]);
    onUpdateActivity({
      ...act,
      status: 'completed',
    });
  };

  const handleLessonIncrement = (courseId: string) => {
    playChime('complete');
    triggerVibration([80, 50, 80]);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFC107', '#FFA000', '#FFFFFF'],
      });
    } catch {
      // ignore
    }
    onIncrementLesson(courseId);
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      {/* 1. Daily Hero Card & Progress Ring */}
      <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{t.daysOfWeek[plannerDay]}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">{t.todayOverview}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {dailyPercentage}% {state.language === 'fa' ? 'پیشرفت امروز' : 'Today Completed'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {toPersianDigits(completedItems, state.language)} / {toPersianDigits(totalItems, state.language)} {state.language === 'fa' ? 'آیتم و فعالیت انجام شد' : 'activities & tasks done'}
            </p>
          </div>

          {/* Circular Progress Ring */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-400 transition-all duration-700 ease-out"
                strokeDasharray={`${dailyPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-white font-mono tabular-nums">
                {toPersianDigits(dailyPercentage, state.language)}%
              </span>
            </div>
          </div>
        </div>

        {/* Streaks Strip */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span className="font-semibold text-white">{toPersianDigits(4, state.language)} {t.weeksStreak}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <span>{t.aiCourse}: {toPersianDigits(aiCourse ? aiCourse.completedLessons : 0, state.language)}/{toPersianDigits(aiCourse ? aiCourse.totalLessons : 0, state.language)}</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Strip */}
      <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
          {t.quickActions}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onOpenQuickAdd('task')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#151515] border border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-900 transition-all active:scale-95 text-center min-h-[70px]"
          >
            <Plus className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium leading-tight">{t.addTask}</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('reminder')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#151515] border border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-900 transition-all active:scale-95 text-center min-h-[70px]"
          >
            <Bell className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium leading-tight">{t.addReminder}</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('session')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#151515] border border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-900 transition-all active:scale-95 text-center min-h-[70px]"
          >
            <Cpu className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium leading-tight">{t.addSession}</span>
          </button>

          <button
            onClick={() => onNavigateToTab('reports')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#151515] border border-zinc-800 text-zinc-200 hover:border-amber-500/50 hover:bg-zinc-900 transition-all active:scale-95 text-center min-h-[70px]"
          >
            <ArrowUpRight className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[11px] font-medium leading-tight">{t.viewReport}</span>
          </button>
        </div>
      </div>

      {/* 3. Course Backlog Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {state.language === 'fa' ? 'خلاصه عقب‌افتادگی دوره‌ها' : 'Course Backlog Tracking'}
          </h3>
          <button
            onClick={() => onNavigateToTab('learning')}
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            {state.language === 'fa' ? 'مدیریت و جزئیات ←' : 'View all →'}
          </button>
        </div>

        <div className="space-y-3">
          {/* AI Python Card */}
          {aiCourse && aiBacklog && (
            <div className="bg-[#151515] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h4 className="text-sm font-bold text-white truncate">
                      {aiCourse.name}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {t.backlogRemaining}: <strong className="text-amber-400 font-mono">{toPersianDigits(aiBacklog.remainingLessons, state.language)}</strong> {t.lessons}
                    <span className="text-zinc-600 mx-1.5">·</span>
                    <span className="text-emerald-400 font-mono">-{toPersianDigits(aiBacklog.netWeeklyReduction, state.language)}</span> {state.language === 'fa' ? 'در هفته' : '/wk'}
                  </p>
                </div>

                <button
                  onClick={() => handleLessonIncrement(aiCourse.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold text-xs transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+۱ {t.lessons}</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${aiBacklog.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5 font-mono">
                  <span>{toPersianDigits(aiCourse.completedLessons, state.language)} / {toPersianDigits(aiCourse.totalLessons, state.language)} {t.lessons}</span>
                  <span className="text-zinc-400">{toPersianDigits(aiBacklog.estimatedWeeksToComplete, state.language)} {state.language === 'fa' ? 'هفته تا اتمام' : 'wks left'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Techno Sharif Math Card */}
          {mathCourse && mathBacklog && (
            <div className="bg-[#151515] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h4 className="text-sm font-bold text-white truncate">
                      {mathCourse.name}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {t.backlogRemaining}: <strong className="text-amber-400 font-mono">{toPersianDigits(mathBacklog.remainingLessons, state.language)}</strong> {t.lessons}
                    <span className="text-zinc-600 mx-1.5">·</span>
                    <span className="text-emerald-400 font-mono">-{toPersianDigits(mathBacklog.netWeeklyReduction, state.language)}</span> {state.language === 'fa' ? 'در هفته' : '/wk'}
                  </p>
                </div>

                <button
                  onClick={() => handleLessonIncrement(mathCourse.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold text-xs transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+۱ {t.lessons}</span>
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${mathBacklog.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1.5 font-mono">
                  <span>{toPersianDigits(mathCourse.completedLessons, state.language)} / {toPersianDigits(mathCourse.totalLessons, state.language)} {t.lessons}</span>
                  <span className="text-zinc-400">{toPersianDigits(mathBacklog.estimatedWeeksToComplete, state.language)} {state.language === 'fa' ? 'هفته تا اتمام' : 'wks left'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Electronics Card */}
          <div className="bg-[#151515] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white truncate">
                    {t.electronicsTitle}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {toPersianDigits(totalElecMinutes, state.language)} {t.studyMinutes}
                  <span className="text-zinc-600 mx-1.5">·</span>
                  <span>{toPersianDigits(state.experiments.length, state.language)} {t.practicalExperiments}</span>
                </p>
              </div>

              <button
                onClick={() => onOpenQuickAdd('session')}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-200 font-semibold text-xs transition-all active:scale-95 shrink-0"
              >
                {t.logStudySession}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Activities Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {t.upcomingActivities} ({t.daysOfWeek[plannerDay]})
          </h3>
          <button
            onClick={() => onNavigateToTab('schedule')}
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            {state.language === 'fa' ? 'مشاهده هفته ←' : 'Full week →'}
          </button>
        </div>

        {todayActivities.length === 0 ? (
          <div className="p-6 text-center bg-[#151515] border border-zinc-800/80 rounded-2xl text-zinc-400 text-xs">
            {t.noUpcomingActivities}
          </div>
        ) : (
          <div className="space-y-2">
            {todayActivities.map((act) => {
              const isDone = act.status === 'completed';
              return (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
                      : 'bg-[#151515] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleCompleteActivity(act)}
                      className={`min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-400/40 border border-zinc-700'
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDone ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                        {act.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        <span className="font-mono">{toPersianDigits(act.startTime, state.language)} - {toPersianDigits(act.endTime, state.language)}</span>
                        <span className="text-zinc-600 mx-1.5">·</span>
                        <span>{t.categories[act.category]}</span>
                      </p>
                    </div>
                  </div>

                  {!isDone && (
                    <button
                      onClick={() => handleCompleteActivity(act)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium shrink-0"
                    >
                      {t.markCompleted}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Pending Tasks */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {t.pendingTasks}
          </h3>
          <button
            onClick={() => onNavigateToTab('tasks')}
            className="text-xs text-amber-400 hover:underline font-medium"
          >
            {state.language === 'fa' ? 'تمام وظایف ←' : 'View all →'}
          </button>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="p-6 text-center bg-[#151515] border border-zinc-800/80 rounded-2xl text-zinc-400 text-xs">
            {t.noPendingTasks}
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-[#151515] border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleCompleteTask(task)}
                    className="min-h-[36px] min-w-[36px] rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-amber-400 hover:border-amber-400/40 flex items-center justify-center transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {task.dueTime && <span className="font-mono">{toPersianDigits(task.dueTime, state.language)} · </span>}
                      <span>{task.category}</span>
                    </p>
                  </div>
                </div>

                {task.priority === 'urgent' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                    {t.priorities.urgent}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
