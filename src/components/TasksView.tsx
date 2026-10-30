import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Clock, 
  Search, 
  Trash2, 
  Filter, 
  ArrowUpDown, 
  X, 
  Calendar, 
  History,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { AppState, TaskItem, TaskPriority, TaskStatus } from '../types';
import { translations, toPersianDigits } from '../utils/translations';
import { playChime, triggerVibration } from '../utils/audio';

interface TasksViewProps {
  state: AppState;
  onAddTask: (task: TaskItem) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  state,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const t = translations[state.language];

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'all' | 'history'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline'>('priority');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('recorded');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('normal');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('18:00');
  const [taskHasReminder, setTaskHasReminder] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleToggleTask = (task: TaskItem) => {
    const isCompleted = task.status === 'completed';
    const nextStatus: TaskStatus = isCompleted ? 'pending' : 'completed';

    if (!isCompleted) {
      playChime('complete');
      triggerVibration([50]);
    }

    onUpdateTask({
      ...task,
      status: nextStatus,
      completedAt: !isCompleted ? new Date().toISOString() : undefined,
    });
  };

  const handlePostponeTask = (task: TaskItem) => {
    // Postpone 1 day
    const current = new Date(task.dueDate);
    current.setDate(current.getDate() + 1);
    const newDueDate = current.toISOString().split('T')[0];

    onUpdateTask({
      ...task,
      dueDate: newDueDate,
      status: 'postponed',
    });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      category: taskCategory,
      priority: taskPriority,
      dueDate: taskDueDate,
      dueTime: taskDueTime || undefined,
      status: 'pending',
      hasReminder: taskHasReminder,
    };

    onAddTask(newTask);
    setIsModalOpen(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  // Filter & Sort Logic
  const filteredTasks = state.tasks
    .filter((task) => {
      // Search
      const q = searchQuery.toLowerCase();
      if (q && !task.title.toLowerCase().includes(q) && !(task.description && task.description.toLowerCase().includes(q))) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Tab view
      if (activeTab === 'history') {
        return task.status === 'completed';
      }
      if (task.status === 'completed') {
        return false; // In active tabs, hide completed
      }
      if (activeTab === 'daily') {
        return task.dueDate === todayStr || task.priority === 'urgent';
      }
      return true; // 'weekly' or 'all'
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityWeight: Record<TaskPriority, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return (a.dueTime ? `${a.dueDate} ${a.dueTime}` : a.dueDate).localeCompare(
        b.dueTime ? `${b.dueDate} ${b.dueTime}` : b.dueDate
      );
    });

  const priorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">{t.priorities.urgent}</span>;
      case 'high':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">{t.priorities.high}</span>;
      case 'normal':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">{t.priorities.normal}</span>;
      case 'low':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400">{t.priorities.low}</span>;
    }
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      {/* 1. Header & Add Task CTA */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            {t.tasks}
          </h2>
          <p className="text-xs text-zinc-400">
            {toPersianDigits(filteredTasks.length, state.language)} {state.language === 'fa' ? 'وظیفه موجود' : 'tasks available'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="min-h-[40px] px-3.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTask}</span>
        </button>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-1 flex items-center justify-between gap-1">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'daily'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.dailyChecklist}
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'weekly'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.weeklyChecklist}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.allTasks}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {state.language === 'fa' ? 'تاریخچه' : 'History'}
        </button>
      </div>

      {/* 3. Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative col-span-1 sm:col-span-1">
          <Search className="w-4 h-4 text-zinc-500 absolute top-3 ltr:left-3 rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchTasks}
            className="w-full bg-[#151515] border border-zinc-800 rounded-xl py-2 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#151515] border border-zinc-800 text-xs text-zinc-300 rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-400"
        >
          <option value="all">{t.filterByPriority} (همه)</option>
          <option value="urgent">{t.priorities.urgent}</option>
          <option value="high">{t.priorities.high}</option>
          <option value="normal">{t.priorities.normal}</option>
          <option value="low">{t.priorities.low}</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'priority' | 'deadline')}
          className="bg-[#151515] border border-zinc-800 text-xs text-zinc-300 rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-400"
        >
          <option value="priority">{t.sortByPriority}</option>
          <option value="deadline">{t.sortByDeadline}</option>
        </select>
      </div>

      {/* 4. Task List */}
      {filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-[#151515] border border-zinc-800/80 rounded-3xl p-6">
          <Check className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-300">
            {activeTab === 'history'
              ? (state.language === 'fa' ? 'هنوز وظیفه‌ای انجام نشده است' : 'No completed tasks yet')
              : (state.language === 'fa' ? 'هیچ وظیفه‌ای در این بخش وجود ندارد' : 'No tasks in this list')}
          </p>
          {activeTab !== 'history' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-200 text-xs font-semibold transition-all"
            >
              {t.addTask}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isPostponed = task.status === 'postponed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-zinc-900/40 border-zinc-800/40 opacity-70'
                    : 'bg-[#151515] border-zinc-800 hover:border-zinc-700 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className={`min-h-[36px] min-w-[36px] mt-0.5 rounded-xl border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                        : 'bg-zinc-900 border-zinc-700 text-transparent hover:border-amber-400'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${isCompleted ? 'text-black stroke-[3]' : 'text-zinc-600'}`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {priorityBadge(task.priority)}
                      <span className="text-xs text-zinc-400 font-medium">
                        {task.category}
                      </span>
                      {isPostponed && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                          <RotateCcw className="w-3 h-3" />
                          <span>{t.statuses.rescheduled}</span>
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-semibold mt-1 text-zinc-100 ${isCompleted ? 'line-through text-zinc-500' : ''}`}>
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-2 font-mono">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{toPersianDigits(task.dueDate, state.language)}</span>
                      {task.dueTime && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{toPersianDigits(task.dueTime, state.language)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => handlePostponeTask(task)}
                      title={t.postponeTask}
                      className="min-h-[32px] px-2.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-amber-400 text-xs font-medium border border-zinc-800 hover:border-zinc-700 transition-all"
                    >
                      {state.language === 'fa' ? '+۱ روز' : '+1d'}
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    title={t.delete}
                    className="min-h-[32px] min-w-[32px] rounded-lg bg-zinc-900 text-zinc-500 hover:text-rose-400 flex items-center justify-center border border-zinc-800 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-md p-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {t.addTask}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {state.language === 'fa' ? 'عنوان وظیفه' : 'Task Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={state.language === 'fa' ? 'مثال: حل مسائل حسابان، مشاهده جلسه پایتون' : 'e.g. Finish physics homework'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t.description}
                </label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={2}
                  placeholder={state.language === 'fa' ? 'جزئیات اختیاری...' : 'Optional details...'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Priority & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {state.language === 'fa' ? 'اولویت' : 'Priority'}
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="urgent">{t.priorities.urgent}</option>
                    <option value="high">{t.priorities.high}</option>
                    <option value="normal">{t.priorities.normal}</option>
                    <option value="low">{t.priorities.low}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t.category}
                  </label>
                  <input
                    type="text"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    placeholder="مدرسه / هوش مصنوعی / ..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t.dueDate}
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t.dueTime}
                  </label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 shadow-sm"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
