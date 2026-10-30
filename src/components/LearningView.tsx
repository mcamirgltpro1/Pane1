import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Cpu, 
  School, 
  Tv, 
  Plus, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Flame, 
  Radio, 
  Calendar, 
  Bookmark, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  AppState, 
  Course, 
  ElectronicsResource, 
  PracticalExperiment, 
  SchoolSubject, 
  EntertainmentItem 
} from '../types';
import { translations, toPersianDigits } from '../utils/translations';
import { calculateBacklog, formatWeeksEstimate } from '../utils/backlog';
import { playChime, triggerVibration } from '../utils/audio';

interface LearningViewProps {
  state: AppState;
  onUpdateCourse: (course: Course) => void;
  onUpdateElectronics: (resources: ElectronicsResource[]) => void;
  onAddExperiment: (exp: PracticalExperiment) => void;
  onUpdateSchoolSubjects: (subjects: SchoolSubject[]) => void;
  onUpdateEntertainment: (items: EntertainmentItem[]) => void;
}

export const LearningView: React.FC<LearningViewProps> = ({
  state,
  onUpdateCourse,
  onUpdateElectronics,
  onAddExperiment,
  onUpdateSchoolSubjects,
  onUpdateEntertainment,
}) => {
  const t = translations[state.language];

  const [activeTab, setActiveTab] = useState<'courses' | 'electronics' | 'school' | 'entertainment'>('courses');

  // Course manual edit modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTotal, setEditTotal] = useState(0);
  const [editCompleted, setEditCompleted] = useState(0);
  const [editTarget, setEditTarget] = useState(0);
  const [editRelease, setEditRelease] = useState(0);

  // Electronics Session Timer (45-minute countdown or stopwatch)
  const [timerSeconds, setTimerSeconds] = useState(45 * 60); // 45 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeStudyResource, setActiveStudyResource] = useState<string>(state.electronicsResources[0]?.id || '');
  const [expandedResource, setExpandedResource] = useState<string | null>(state.electronicsResources[0]?.id || null);

  // New Experiment modal
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // School modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTeacherName, setNewTeacherName] = useState('');

  // Entertainment modal
  const [isEntModalOpen, setIsEntModalOpen] = useState(false);
  const [entTitle, setEntTitle] = useState('');
  const [entType, setEntType] = useState<'movie' | 'series' | 'gaming'>('movie');
  const [entDuration, setEntDuration] = useState(90);

  // Study Timer Tick Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChime('complete');
      triggerVibration([100, 50, 100, 50, 200]);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      // Automatically log 45 minutes to active resource
      if (activeStudyResource) {
        logStudyMinutes(activeStudyResource, 45);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds, activeStudyResource]);

  const formatTimerDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLessonIncrement = (course: Course) => {
    playChime('complete');
    triggerVibration([70]);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onUpdateCourse({
      ...course,
      completedLessons: Math.min(course.totalLessons, course.completedLessons + 1),
    });
  };

  const handleLessonDecrement = (course: Course) => {
    if (course.completedLessons <= 0) return;
    onUpdateCourse({
      ...course,
      completedLessons: course.completedLessons - 1,
    });
  };

  const handleToggleLivePhase = (course: Course) => {
    onUpdateCourse({
      ...course,
      isLivePhase: !course.isLivePhase,
    });
  };

  const openCourseEdit = (course: Course) => {
    setEditingCourse(course);
    setEditTotal(course.totalLessons);
    setEditCompleted(course.completedLessons);
    setEditTarget(course.weeklyTarget);
    setEditRelease(course.newLessonsPerWeek);
  };

  const saveCourseEdit = () => {
    if (!editingCourse) return;
    onUpdateCourse({
      ...editingCourse,
      totalLessons: Number(editTotal),
      completedLessons: Number(editCompleted),
      weeklyTarget: Number(editTarget),
      newLessonsPerWeek: Number(editRelease),
    });
    setEditingCourse(null);
  };

  const toggleChapter = (resourceId: string, chapterId: string) => {
    const updated = state.electronicsResources.map((res) => {
      if (res.id !== resourceId) return res;
      const updatedChapters = res.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const nextCompleted = !ch.completed;
        if (nextCompleted) {
          playChime('complete');
          triggerVibration([40]);
        }
        return { ...ch, completed: nextCompleted };
      });
      const completedCount = updatedChapters.filter((c) => c.completed).length;
      return {
        ...res,
        chapters: updatedChapters,
        completedChapters: completedCount,
      };
    });
    onUpdateElectronics(updated);
  };

  const logStudyMinutes = (resourceId: string, minutes: number) => {
    const updated = state.electronicsResources.map((res) => {
      if (res.id !== resourceId) return res;
      return {
        ...res,
        studyMinutesLogged: res.studyMinutesLogged + minutes,
      };
    });
    onUpdateElectronics(updated);
  };

  const handleSaveExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;

    onAddExperiment({
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      notes: expNotes.trim(),
      completed: true,
    });

    setIsExpModalOpen(false);
    setExpTitle('');
    setExpNotes('');
    playChime('complete');
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      {/* 1. Sub-Navigation Tabs */}
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-1 flex items-center justify-between gap-1 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'courses'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="truncate">{state.language === 'fa' ? 'دوره‌ها و عقب‌افتادگی' : 'Courses'}</span>
        </button>

        <button
          onClick={() => setActiveTab('electronics')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'electronics'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 shrink-0" />
          <span className="truncate">{state.language === 'fa' ? 'خودآموزی الکترونیک' : 'Electronics'}</span>
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'school'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <School className="w-4 h-4 shrink-0" />
          <span className="truncate">{state.language === 'fa' ? 'مدرسه' : 'School'}</span>
        </button>

        <button
          onClick={() => setActiveTab('entertainment')}
          className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'entertainment'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4 shrink-0" />
          <span className="truncate">{state.language === 'fa' ? 'تفریح' : 'Fun'}</span>
        </button>
      </div>

      {/* TAB 1: COURSES & BACKLOGS */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-4">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{state.language === 'fa' ? 'فرمول و محاسبه کاهش عقب‌افتادگی (Backlog)' : 'Backlog Reduction Engine'}</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              {state.language === 'fa'
                ? 'کاهش خالص هفتگی = جلسات هدف هفتگی - جلسات تازه منتشر شده'
                : 'Net Weekly Reduction = Weekly Target - New Released Lessons'}
            </p>
          </div>

          {state.courses.map((course) => {
            const backlog = calculateBacklog(course);

            return (
              <div
                key={course.id}
                className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4"
              >
                {/* Course Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {course.instructor}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 truncate">
                      {course.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <button
                    onClick={() => openCourseEdit(course)}
                    className="text-xs text-amber-400 hover:underline shrink-0 font-medium px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                  >
                    {t.lessonCountCorrect}
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="text-zinc-300">
                      {toPersianDigits(course.completedLessons, state.language)} / {toPersianDigits(course.totalLessons, state.language)} {t.lessons} ({toPersianDigits(backlog.progressPercent, state.language)}%)
                    </span>
                    <span className="text-amber-400 font-semibold">
                      {toPersianDigits(backlog.remainingLessons, state.language)} {t.lessonsRemaining}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${backlog.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80 text-center">
                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 block">{t.weeklyTarget}</span>
                    <span className="text-sm font-bold text-white font-mono">{toPersianDigits(course.weeklyTarget, state.language)}</span>
                  </div>
                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 block">{t.newLessonsPerWeek}</span>
                    <span className="text-sm font-bold text-amber-400 font-mono">+{toPersianDigits(course.newLessonsPerWeek, state.language)}</span>
                  </div>
                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 block">{t.netBacklogReduction}</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">-{toPersianDigits(backlog.netWeeklyReduction, state.language)}</span>
                  </div>
                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 block">{t.estimatedWeeksLeft}</span>
                    <span className="text-sm font-bold text-zinc-200 font-mono">{formatWeeksEstimate(backlog.estimatedWeeksToComplete, state.language)}</span>
                  </div>
                </div>

                {/* Interactive Controls & Live Phase Switch */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800/80 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleLessonDecrement(course)}
                      disabled={course.completedLessons <= 0}
                      className="min-h-[36px] px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 text-xs font-semibold active:scale-95 transition-all"
                    >
                      -۱ {t.lessons}
                    </button>
                    <button
                      onClick={() => handleLessonIncrement(course)}
                      className="min-h-[36px] px-4 rounded-xl bg-amber-400 text-black hover:bg-amber-300 text-xs font-bold shadow-sm shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.completeLesson}</span>
                    </button>
                  </div>

                  {/* Future Live Phase toggle */}
                  <button
                    onClick={() => handleToggleLivePhase(course)}
                    className={`min-h-[36px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      course.isLivePhase
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{course.isLivePhase ? t.livePhase : t.livePhaseSwitch} ({toPersianDigits(course.liveSessionsPerWeek, state.language)} {state.language === 'fa' ? 'جلسه در هفته' : '/wk'})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ELECTRONICS SELF-STUDY ROADMAP */}
      {activeTab === 'electronics' && (
        <div className="space-y-4">
          {/* Study Timer Card (45 minutes) */}
          <div className="bg-[#151515] border border-amber-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {t.logStudySession}
                </h3>
              </div>
              <span className="text-xs text-amber-400 font-medium">
                {t.weeklyStudyTarget}
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              {state.language === 'fa'
                ? 'جلسه مطالعه خود را آغاز کنید تا پس از ۴۵ دقیقه به صورت خودکار در سابقه ثبت شود.'
                : 'Start a 45-minute focused session. Time is automatically logged to your roadmap.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
              <div className="text-3xl font-bold font-mono tracking-wider text-amber-400 tabular-nums">
                {toPersianDigits(formatTimerDisplay(timerSeconds), state.language)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`min-h-[40px] px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${
                    isTimerRunning
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-amber-400 text-black hover:bg-amber-300'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? (state.language === 'fa' ? 'توقف' : 'Pause') : (state.language === 'fa' ? 'شروع مطالعه' : 'Start')}</span>
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(45 * 60);
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    logStudyMinutes(activeStudyResource, 45);
                    playChime('complete');
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold"
                >
                  +۴۵m {state.language === 'fa' ? 'دستی' : 'manual'}
                </button>
              </div>
            </div>
          </div>

          {/* Practical Experiments Section */}
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.practicalExperiments}</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  {toPersianDigits(state.experiments.length, state.language)} {state.language === 'fa' ? 'آزمایش و مدار ثبت شده' : 'circuits & experiments'}
                </p>
              </div>

              <button
                onClick={() => setIsExpModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addExperiment}</span>
              </button>
            </div>

            <div className="space-y-2">
              {state.experiments.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">{exp.title}</h4>
                    {exp.notes && <p className="text-xs text-zinc-400 mt-0.5">{exp.notes}</p>}
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{toPersianDigits(exp.date, state.language)}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
                    {state.language === 'fa' ? 'انجام شده' : 'Done'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6 Core Textbooks & Resources */}
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 px-1">
              {t.resourcesAndBooks} ({toPersianDigits(state.electronicsResources.length, state.language)} {state.language === 'fa' ? 'کتاب / پودمان' : 'books'})
            </h3>

            <div className="space-y-3">
              {state.electronicsResources.map((res) => {
                const isExpanded = expandedResource === res.id;
                const progressPct = res.totalChapters > 0
                  ? Math.round((res.completedChapters / res.totalChapters) * 100)
                  : 0;

                return (
                  <div
                    key={res.id}
                    className="bg-[#151515] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setExpandedResource(isExpanded ? null : res.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                          <h4 className="text-sm font-bold text-white truncate">
                            {state.language === 'fa' ? res.titleFa : res.titleEn}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          {toPersianDigits(res.completedChapters, state.language)} / {toPersianDigits(res.totalChapters, state.language)} {state.language === 'fa' ? 'مبحث تکمیل شده' : 'topics done'}
                          <span className="text-zinc-600 mx-1.5">·</span>
                          <span className="font-mono text-amber-400">{toPersianDigits(res.studyMinutesLogged, state.language)} {t.studyMinutes}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {toPersianDigits(progressPct, state.language)}%
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </div>
                    </div>

                    {/* Expanded Chapters Checklist */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-zinc-800/80 space-y-2">
                        {res.bookmark && (
                          <div className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/20 text-xs text-amber-300 flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{t.bookmarks}: {res.bookmark}</span>
                          </div>
                        )}

                        <div className="space-y-1.5 pt-1">
                          {res.chapters.map((ch) => (
                            <label
                              key={ch.id}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/60 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={ch.completed}
                                onChange={() => toggleChapter(res.id, ch.id)}
                                className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-zinc-900 border-zinc-800 cursor-pointer"
                              />
                              <span className={`text-xs ${ch.completed ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'}`}>
                                {ch.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHOOL MANAGEMENT */}
      {activeTab === 'school' && (
        <div className="space-y-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">{t.schoolManagement}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {state.language === 'fa' ? 'مدیریت دروس، تکالیف و امتحانات مدرسه' : 'Subjects, assignments, and exam schedules'}
              </p>
            </div>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addSubject}</span>
            </button>
          </div>

          <div className="space-y-3">
            {state.schoolSubjects.map((sub) => (
              <div key={sub.id} className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                    {sub.teacher && <p className="text-xs text-zinc-400">{sub.teacher}</p>}
                  </div>
                </div>

                {/* Homework */}
                {sub.homework.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-zinc-400">{t.homeworkList}:</span>
                    {sub.homework.map((hw) => (
                      <div key={hw.id} className="text-xs text-zinc-300 flex items-center justify-between p-2 rounded-lg bg-zinc-900/60">
                        <span>{hw.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{toPersianDigits(hw.dueDate, state.language)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exams */}
                {sub.exams.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-amber-400">{t.examsList}:</span>
                    {sub.exams.map((ex) => (
                      <div key={ex.id} className="text-xs text-zinc-300 flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-amber-500/20">
                        <span>{ex.title}</span>
                        <span className="text-[10px] text-amber-300 font-mono">{toPersianDigits(ex.date, state.language)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENTERTAINMENT & FREE TIME */}
      {activeTab === 'entertainment' && (
        <div className="space-y-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                {state.language === 'fa' ? 'تفریح و اوقات فراغت' : 'Entertainment & Free Time'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {state.language === 'fa' ? 'برنامه‌ریزی فیلم، سریال و بازی جدا از وظایف اصلی' : 'Scheduled movies, series & gaming'}
              </p>
            </div>
            <button
              onClick={() => setIsEntModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{state.language === 'fa' ? 'افزودن تفریح' : 'Add Fun'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {state.entertainmentItems.map((ent) => (
              <div
                key={ent.id}
                className="p-3.5 rounded-2xl bg-[#151515] border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">{ent.title}</h4>
                  <p className="text-xs text-zinc-400 capitalize">
                    {ent.type} {ent.durationMinutes ? `· ${toPersianDigits(ent.durationMinutes, state.language)} mins` : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const updated = state.entertainmentItems.map((i) => i.id === ent.id ? { ...i, completed: !i.completed } : i);
                    onUpdateEntertainment(updated);
                  }}
                  className={`min-h-[32px] px-3 rounded-xl text-xs font-medium transition-all ${
                    ent.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  {ent.completed ? (state.language === 'fa' ? 'انجام شد' : 'Done') : (state.language === 'fa' ? 'تکمیل' : 'Complete')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              {t.lessonCountCorrect}: {editingCourse.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.totalLessons}</label>
                <input
                  type="number"
                  value={editTotal}
                  onChange={(e) => setEditTotal(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.completedLessons}</label>
                <input
                  type="number"
                  value={editCompleted}
                  onChange={(e) => setEditCompleted(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.weeklyTarget}</label>
                <input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.newLessonsPerWeek}</label>
                <input
                  type="number"
                  step="0.5"
                  value={editRelease}
                  onChange={(e) => setEditRelease(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={saveCourseEdit}
                className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-sm"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practical Experiment Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">
              {t.addExperiment}
            </h3>

            <form onSubmit={handleSaveExperiment} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.experimentTitle} *</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder={state.language === 'fa' ? 'مثال: تقویت‌کننده ترانزیستوری کلاس A' : 'e.g. Inverting Op-Amp circuit'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.notes}</label>
                <textarea
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  rows={2}
                  placeholder={state.language === 'fa' ? 'نتایج و مقادیر قطعات...' : 'Component values and notes...'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">{t.addSubject}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{t.subjectName}</label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{state.language === 'fa' ? 'نام دبیر / استاد' : 'Teacher'}</label>
                <input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  if (!newSubjectName.trim()) return;
                  const newSub: SchoolSubject = {
                    id: `sub-${Date.now()}`,
                    name: newSubjectName.trim(),
                    teacher: newTeacherName.trim(),
                    homework: [],
                    exams: []
                  };
                  onUpdateSchoolSubjects([...state.schoolSubjects, newSub]);
                  setIsSubjectModalOpen(false);
                  setNewSubjectName('');
                  setNewTeacherName('');
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entertainment Modal */}
      {isEntModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">{state.language === 'fa' ? 'افزودن فعالیت تفریحی' : 'Add Entertainment'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{state.language === 'fa' ? 'عنوان' : 'Title'}</label>
                <input
                  type="text"
                  value={entTitle}
                  onChange={(e) => setEntTitle(e.target.value)}
                  placeholder="فیلم مستند / بازی / سریال"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">{state.language === 'fa' ? 'نوع' : 'Type'}</label>
                <select
                  value={entType}
                  onChange={(e) => setEntType(e.target.value as 'movie' | 'series' | 'gaming')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="movie">فیلم (Movie)</option>
                  <option value="series">سریال (Series)</option>
                  <option value="gaming">بازی (Gaming)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsEntModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  if (!entTitle.trim()) return;
                  const newEnt: EntertainmentItem = {
                    id: `ent-${Date.now()}`,
                    title: entTitle.trim(),
                    type: entType,
                    durationMinutes: entDuration,
                    completed: false,
                  };
                  onUpdateEntertainment([...state.entertainmentItems, newEnt]);
                  setIsEntModalOpen(false);
                  setEntTitle('');
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
