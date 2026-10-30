import React, { useState } from 'react';
import { X, Bell, CheckSquare, Calendar, Cpu } from 'lucide-react';
import { AppState, ReminderItem, ReminderRecurrence, ReminderPriority, TaskItem, ScheduleActivity, ActivityCategory } from '../types';
import { translations } from '../utils/translations';
import { playChime, triggerVibration } from '../utils/audio';

interface QuickAddModalProps {
  isOpen: boolean;
  type: 'task' | 'reminder' | 'activity' | 'session' | null;
  onClose: () => void;
  state: AppState;
  onAddReminder: (reminder: ReminderItem) => void;
  onAddTask: (task: TaskItem) => void;
  onAddActivity: (act: ScheduleActivity) => void;
  onLogSession: (resourceId: string, minutes: number) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  type,
  onClose,
  state,
  onAddReminder,
  onAddTask,
  onAddActivity,
  onLogSession,
}) => {
  const t = translations[state.language];

  // Reminder fields
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState(new Date().toISOString().slice(0, 16));
  const [remRecurrence, setRemRecurrence] = useState<ReminderRecurrence>('none');
  const [remPriority, setRemPriority] = useState<ReminderPriority>('normal');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('recorded');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Session fields
  const [sessionResourceId, setSessionResourceId] = useState(state.electronicsResources[0]?.id || '');
  const [sessionMinutes, setSessionMinutes] = useState(45);

  if (!isOpen || !type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'reminder') {
      if (!remTitle.trim()) return;
      onAddReminder({
        id: `rem-${Date.now()}`,
        title: remTitle.trim(),
        dateTime: remDate,
        recurrence: remRecurrence,
        priority: remPriority,
        soundEnabled: true,
        vibrateEnabled: true,
        isCompleted: false,
      });
      playChime('gentle');
      triggerVibration([60]);
    } else if (type === 'task') {
      if (!taskTitle.trim()) return;
      onAddTask({
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        category: taskCategory,
        priority: 'high',
        dueDate: taskDueDate,
        status: 'pending',
      });
      playChime('complete');
    } else if (type === 'session') {
      onLogSession(sessionResourceId, sessionMinutes);
      playChime('complete');
      triggerVibration([50]);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {type === 'reminder' && <Bell className="w-4 h-4 text-amber-400" />}
            {type === 'task' && <CheckSquare className="w-4 h-4 text-amber-400" />}
            {type === 'session' && <Cpu className="w-4 h-4 text-amber-400" />}
            <h3 className="text-base font-bold text-white">
              {type === 'reminder' && t.addReminder}
              {type === 'task' && t.addTask}
              {type === 'session' && t.logStudySession}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {type === 'reminder' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t.reminderTitle} *</label>
                <input
                  type="text"
                  required
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="مشاهده جلسه پایتون / تمرین ریاضی"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t.reminderDateTime}</label>
                <input
                  type="datetime-local"
                  value={remDate}
                  onChange={(e) => setRemDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t.recurrence}</label>
                <select
                  value={remRecurrence}
                  onChange={(e) => setRemRecurrence(e.target.value as ReminderRecurrence)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="none">{t.recurrences.none}</option>
                  <option value="daily">{t.recurrences.daily}</option>
                  <option value="weekly">{t.recurrences.weekly}</option>
                  <option value="biweekly">{t.recurrences.biweekly}</option>
                </select>
              </div>
            </>
          )}

          {type === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{state.language === 'fa' ? 'عنوان وظیفه' : 'Title'} *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="حل مسائل ریاضی / مطالعه قطعات"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t.dueDate}</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          )}

          {type === 'session' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t.resourcesAndBooks}</label>
                <select
                  value={sessionResourceId}
                  onChange={(e) => setSessionResourceId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {state.electronicsResources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {state.language === 'fa' ? r.titleFa : r.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t.studyMinutes}</label>
                <input
                  type="number"
                  value={sessionMinutes}
                  onChange={(e) => setSessionMinutes(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
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
  );
};
