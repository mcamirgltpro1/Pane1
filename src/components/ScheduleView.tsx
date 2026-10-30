import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Repeat, 
  Filter,
  ArrowRightLeft
} from 'lucide-react';
import { AppState, ScheduleActivity, ActivityCategory, ActivityStatus } from '../types';
import { translations, toPersianDigits } from '../utils/translations';
import { playChime, triggerVibration } from '../utils/audio';

interface ScheduleViewProps {
  state: AppState;
  onAddActivity: (activity: ScheduleActivity) => void;
  onUpdateActivity: (activity: ScheduleActivity) => void;
  onDeleteActivity: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  state,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const t = translations[state.language];

  // Active day selection: 0 = Saturday ... 6 = Friday
  const jsDay = new Date().getDay();
  const defaultDay = jsDay === 6 ? 0 : jsDay + 1;
  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ScheduleActivity | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('school');
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('09:30');
  const [formDescription, setFormDescription] = useState('');
  const [formRecurringWeekly, setFormRecurringWeekly] = useState(true);

  // Move activity modal state
  const [movingActivity, setMovingActivity] = useState<ScheduleActivity | null>(null);

  const openAddModal = () => {
    setEditingActivity(null);
    setFormTitle('');
    setFormCategory('school');
    setFormStartTime('08:00');
    setFormEndTime('09:30');
    setFormDescription('');
    setFormRecurringWeekly(true);
    setIsModalOpen(true);
  };

  const openEditModal = (act: ScheduleActivity) => {
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormCategory(act.category);
    setFormStartTime(act.startTime);
    setFormEndTime(act.endTime);
    setFormDescription(act.description || '');
    setFormRecurringWeekly(act.isRecurringWeekly || false);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingActivity) {
      onUpdateActivity({
        ...editingActivity,
        title: formTitle.trim(),
        category: formCategory,
        startTime: formStartTime,
        endTime: formEndTime,
        description: formDescription.trim(),
        isRecurringWeekly: formRecurringWeekly,
      });
    } else {
      const newAct: ScheduleActivity = {
        id: `act-${Date.now()}`,
        title: formTitle.trim(),
        dayOfWeek: selectedDay,
        startTime: formStartTime,
        endTime: formEndTime,
        category: formCategory,
        status: 'planned',
        description: formDescription.trim(),
        isRecurringWeekly: formRecurringWeekly,
      };
      onAddActivity(newAct);
    }

    setIsModalOpen(false);
  };

  const handleStatusChange = (act: ScheduleActivity, newStatus: ActivityStatus) => {
    if (newStatus === 'completed') {
      playChime('complete');
      triggerVibration([60]);
    }
    onUpdateActivity({
      ...act,
      status: newStatus,
    });
  };

  const handleMoveDay = (targetDay: number) => {
    if (!movingActivity) return;
    onUpdateActivity({
      ...movingActivity,
      dayOfWeek: targetDay,
    });
    setMovingActivity(null);
  };

  // Filter activities for selected day
  const filteredActivities = state.scheduleActivities
    .filter((a) => a.dayOfWeek === selectedDay)
    .filter((a) => categoryFilter === 'all' || a.category === categoryFilter)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const categoryList: ActivityCategory[] = [
    'school',
    'recorded',
    'online',
    'electronics',
    'sports',
    'mosque',
    'homework',
    'exams',
    'entertainment',
    'rest',
    'personal',
  ];

  return (
    <div className="space-y-5 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      {/* 1. Day of Week Selector (Saturday to Friday) */}
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-sm overflow-x-auto">
        {t.daysOfWeekShort.map((dayShort, idx) => {
          const isSelected = selectedDay === idx;
          const actsForThisDay = state.scheduleActivities.filter((a) => a.dayOfWeek === idx);
          const completedCount = actsForThisDay.filter((a) => a.status === 'completed').length;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`flex-1 min-w-[40px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <span className="text-xs">{dayShort}</span>
              <span className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-black/80' : 'text-zinc-500'}`}>
                {toPersianDigits(completedCount, state.language)}/{toPersianDigits(actsForThisDay.length, state.language)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Top bar for the day: Title, Filter & Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{t.daysOfWeek[selectedDay]}</span>
            <span className="text-xs font-normal text-zinc-400">
              ({toPersianDigits(filteredActivities.length, state.language)} {state.language === 'fa' ? 'برنامه' : 'items'})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-2.5 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="all">{state.language === 'fa' ? 'همه دسته‌ها' : 'All Categories'}</option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {t.categories[cat]}
              </option>
            ))}
          </select>

          {/* Add Activity Button */}
          <button
            onClick={openAddModal}
            className="min-h-[40px] px-3 rounded-xl bg-amber-400 text-black hover:bg-amber-300 font-semibold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addActivity}</span>
          </button>
        </div>
      </div>

      {/* 3. Timeline / Activity Cards */}
      {filteredActivities.length === 0 ? (
        <div className="py-16 text-center bg-[#151515] border border-zinc-800/80 rounded-3xl p-6">
          <CalendarIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-300">
            {state.language === 'fa' ? 'هیچ برنامه‌ای برای این روز ثبت نشده است' : 'No activities scheduled for this day'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {state.language === 'fa' ? 'با کلیک روی دکمه افزودن، اولین برنامه خود را ثبت کنید' : 'Tap Add Activity to schedule a class, study session, or workout'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-200 text-xs font-semibold transition-all"
          >
            {t.addActivity}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const isCompleted = act.status === 'completed';
            const isSkipped = act.status === 'skipped';
            const isRescheduled = act.status === 'rescheduled';

            return (
              <div
                key={act.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-zinc-900/40 border-zinc-800/40 opacity-70'
                    : isSkipped
                    ? 'bg-zinc-900/30 border-rose-900/30 opacity-60'
                    : 'bg-[#151515] border-zinc-800 hover:border-zinc-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {toPersianDigits(act.startTime, state.language)} - {toPersianDigits(act.endTime, state.language)}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs font-medium text-zinc-400">
                        {t.categories[act.category]}
                      </span>
                      {act.isRecurringWeekly && (
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                          <Repeat className="w-3 h-3 text-amber-500/70" />
                          <span>{t.recurringWeekly}</span>
                        </span>
                      )}
                    </div>

                    <h4 className={`text-base font-bold mt-1 text-zinc-100 ${isCompleted ? 'line-through text-zinc-400' : ''}`}>
                      {act.title}
                    </h4>

                    {act.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {act.description}
                      </p>
                    )}
                  </div>

                  {/* Quick Status Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStatusChange(act, isCompleted ? 'planned' : 'completed')}
                      title={t.statuses.completed}
                      className={`min-h-[36px] min-w-[36px] rounded-xl flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openEditModal(act)}
                      title={t.editActivity}
                      className="min-h-[36px] min-w-[36px] rounded-xl bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 flex items-center justify-center transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setMovingActivity(act)}
                      title={t.moveToDay}
                      className="min-h-[36px] min-w-[36px] rounded-xl bg-zinc-800 text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 flex items-center justify-center transition-all"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteActivity(act.id)}
                      title={t.deleteActivity}
                      className="min-h-[36px] min-w-[36px] rounded-xl bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700 flex items-center justify-center transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Secondary Status Dropdown */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                  <span className="text-zinc-500">{t.status}:</span>
                  <div className="flex items-center gap-1">
                    {(['planned', 'completed', 'skipped', 'rescheduled'] as ActivityStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(act, st)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] transition-all ${
                          act.status === st
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {t.statuses[st]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-md p-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingActivity ? t.editActivity : t.addActivity}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 mt-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t.activityTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={state.language === 'fa' ? 'مثال: دوره هوش مصنوعی، فوتبال، مطالعه' : 'e.g. AI Python, Math class'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t.category}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {t.categories[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t.startTime}
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {t.endTime}
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  {t.description}
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder={state.language === 'fa' ? 'توضیحات و جزئیات...' : 'Details and notes...'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Weekly Recurring Toggle */}
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formRecurringWeekly}
                  onChange={(e) => setFormRecurringWeekly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-zinc-900 border-zinc-800"
                />
                <span>{t.recurringWeekly}</span>
              </label>

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

      {/* Move Day Modal */}
      {movingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151515] border border-zinc-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">
              {t.moveToDay}: {movingActivity.title}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {state.language === 'fa' ? 'روز مقصد را برای انتقال این برنامه انتخاب کنید:' : 'Select target day to move this activity to:'}
            </p>

            <div className="grid grid-cols-1 gap-1.5">
              {t.daysOfWeek.map((dayName, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMoveDay(idx)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-start transition-all ${
                    movingActivity.dayOfWeek === idx
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {dayName} {movingActivity.dayOfWeek === idx && `(${state.language === 'fa' ? 'روز فعلی' : 'Current'})`}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setMovingActivity(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
