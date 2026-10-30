import React, { useState, useMemo } from 'react';
import { Search, X, CheckSquare, Calendar, GraduationCap, Bell, ArrowRight } from 'lucide-react';
import { AppState, Language } from '../types';
import { translations } from '../utils/translations';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onNavigateToTab: (tab: 'dashboard' | 'schedule' | 'tasks' | 'learning' | 'reports' | 'settings') => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  state,
  onNavigateToTab,
}) => {
  const [query, setQuery] = useState('');
  const t = translations[state.language];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const list: {
      id: string;
      title: string;
      subtitle: string;
      type: 'task' | 'activity' | 'course' | 'reminder';
      tab: 'dashboard' | 'schedule' | 'tasks' | 'learning' | 'reports' | 'settings';
    }[] = [];

    // Tasks
    state.tasks.forEach((task) => {
      if (task.title.toLowerCase().includes(q) || (task.description && task.description.toLowerCase().includes(q))) {
        list.push({
          id: task.id,
          title: task.title,
          subtitle: task.dueDate ? `${task.category} · ${task.dueDate}` : task.category,
          type: 'task',
          tab: 'tasks',
        });
      }
    });

    // Activities
    state.scheduleActivities.forEach((act) => {
      if (act.title.toLowerCase().includes(q) || (act.description && act.description.toLowerCase().includes(q))) {
        list.push({
          id: act.id,
          title: act.title,
          subtitle: `${t.daysOfWeek[act.dayOfWeek]} · ${act.startTime} - ${act.endTime}`,
          type: 'activity',
          tab: 'schedule',
        });
      }
    });

    // Courses
    state.courses.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)) {
        list.push({
          id: c.id,
          title: c.name,
          subtitle: `${c.completedLessons}/${c.totalLessons} ${t.lessons}`,
          type: 'course',
          tab: 'learning',
        });
      }
    });

    // Reminders
    state.reminders.forEach((r) => {
      if (r.title.toLowerCase().includes(q)) {
        list.push({
          id: r.id,
          title: r.title,
          subtitle: r.dateTime.replace('T', ' '),
          type: 'reminder',
          tab: 'dashboard',
        });
      }
    });

    return list;
  }, [query, state, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#151515] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={state.language === 'fa' ? 'جستجو در وظایف، برنامه‌ها، دوره‌ها...' : 'Search tasks, activities, courses...'}
            autoFocus
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs"
            >
              {t.close}
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-800/40">
          {query && results.length === 0 && (
            <div className="py-12 text-center text-zinc-400 text-sm">
              {state.language === 'fa' ? 'موردی یافت نشد.' : 'No results found.'}
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-zinc-400 text-xs">
              {state.language === 'fa' ? 'کلمه مورد نظر خود را تایپ کنید...' : 'Type to search across everything...'}
            </div>
          )}

          {results.map((res) => (
            <button
              key={`${res.type}-${res.id}`}
              onClick={() => {
                onNavigateToTab(res.tab);
                onClose();
              }}
              className="w-full p-3 flex items-center justify-between text-start hover:bg-zinc-800/50 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-amber-400">
                  {res.type === 'task' && <CheckSquare className="w-4 h-4" />}
                  {res.type === 'activity' && <Calendar className="w-4 h-4" />}
                  {res.type === 'course' && <GraduationCap className="w-4 h-4" />}
                  {res.type === 'reminder' && <Bell className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-amber-300">
                    {res.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {res.subtitle}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 shrink-0 ltr:rotate-0 rtl:rotate-180 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
