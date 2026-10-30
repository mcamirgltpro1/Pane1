/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, Course, ElectronicsResource, PracticalExperiment, ReminderItem, ScheduleActivity, TaskItem, SchoolSubject, EntertainmentItem, WeeklyReportData, Language, ThemeMode } from './types';
import { loadAppState, saveAppState, defaultState } from './storage/db';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { TasksView } from './components/TasksView';
import { LearningView } from './components/LearningView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickAddModal } from './components/QuickAddModal';
import { playChime, triggerVibration, sendBrowserNotification } from './utils/audio';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'reminder' | 'activity' | 'session' | null>(null);
  const [activeAlarmNotification, setActiveAlarmNotification] = useState<string | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync HTML lang and dir attributes for Persian RTL and English LTR
  useEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dir = state.language === 'fa' ? 'rtl' : 'ltr';
  }, [state.language]);

  // Sync dark class on html element
  useEffect(() => {
    if (state.theme === 'amoled' || state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Periodic Reminder / Alarm checker (runs every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentIso = now.toISOString().slice(0, 16);

      state.reminders.forEach((rem) => {
        if (!rem.isCompleted && rem.dateTime <= currentIso) {
          // Trigger alarm
          playChime('urgent');
          triggerVibration([200, 100, 200, 100, 400]);
          sendBrowserNotification(rem.title, rem.description || 'زمان یادآور فرا رسیده است');
          setActiveAlarmNotification(rem.title);

          // Mark completed or snooze
          setState((prev) => ({
            ...prev,
            reminders: prev.reminders.map((r) =>
              r.id === rem.id ? { ...r, isCompleted: true } : r
            ),
          }));
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [state.reminders]);

  // Handlers
  const handleToggleLanguage = () => {
    setState((prev) => ({
      ...prev,
      language: prev.language === 'fa' ? 'en' : 'fa',
    }));
  };

  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'amoled' ? 'light' : 'amoled',
    }));
  };

  const handleUpdateLanguage = (lang: Language) => {
    setState((prev) => ({ ...prev, language: lang }));
  };

  const handleUpdateTheme = (theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }));
  };

  // Tasks
  const handleAddTask = (task: TaskItem) => {
    setState((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
    }));
  };

  const handleUpdateTask = (task: TaskItem) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  };

  const handleDeleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  // Activities
  const handleAddActivity = (activity: ScheduleActivity) => {
    setState((prev) => ({
      ...prev,
      scheduleActivities: [...prev.scheduleActivities, activity],
    }));
  };

  const handleUpdateActivity = (activity: ScheduleActivity) => {
    setState((prev) => ({
      ...prev,
      scheduleActivities: prev.scheduleActivities.map((a) => (a.id === activity.id ? activity : a)),
    }));
  };

  const handleDeleteActivity = (id: string) => {
    setState((prev) => ({
      ...prev,
      scheduleActivities: prev.scheduleActivities.filter((a) => a.id !== id),
    }));
  };

  // Courses
  const handleUpdateCourse = (course: Course) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === course.id ? course : c)),
    }));
  };

  const handleIncrementLesson = (courseId: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          completedLessons: Math.min(c.totalLessons, c.completedLessons + 1),
        };
      }),
    }));
  };

  // Electronics
  const handleUpdateElectronics = (resources: ElectronicsResource[]) => {
    setState((prev) => ({
      ...prev,
      electronicsResources: resources,
    }));
  };

  const handleAddExperiment = (exp: PracticalExperiment) => {
    setState((prev) => ({
      ...prev,
      experiments: [exp, ...prev.experiments],
    }));
  };

  const handleLogStudySession = (resourceId: string, minutes: number) => {
    setState((prev) => ({
      ...prev,
      electronicsResources: prev.electronicsResources.map((r) =>
        r.id === resourceId ? { ...r, studyMinutesLogged: r.studyMinutesLogged + minutes } : r
      ),
    }));
  };

  // School & Entertainment
  const handleUpdateSchoolSubjects = (subjects: SchoolSubject[]) => {
    setState((prev) => ({ ...prev, schoolSubjects: subjects }));
  };

  const handleUpdateEntertainment = (items: EntertainmentItem[]) => {
    setState((prev) => ({ ...prev, entertainmentItems: items }));
  };

  // Reminders
  const handleAddReminder = (reminder: ReminderItem) => {
    setState((prev) => ({
      ...prev,
      reminders: [reminder, ...prev.reminders],
    }));
  };

  // Reports
  const handleSaveReport = (report: WeeklyReportData) => {
    setState((prev) => ({
      ...prev,
      weeklyReports: [report, ...prev.weeklyReports],
    }));
  };

  // Restore & Reset
  const handleRestoreState = (importedState: AppState) => {
    setState(importedState);
  };

  const handleResetState = () => {
    setState(defaultState);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${state.theme === 'light' ? 'bg-zinc-50 text-zinc-900' : 'bg-[#090909] text-zinc-100'}`}>
      {/* Active Alarm Toast Banner */}
      {activeAlarmNotification && (
        <div className="fixed top-3 left-4 right-4 z-50 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-2xl flex items-center justify-between gap-3 animate-bounce">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider block">
              {state.language === 'fa' ? 'هشدار یادآور!' : 'Reminder Alert!'}
            </span>
            <p className="text-sm font-bold truncate">{activeAlarmNotification}</p>
          </div>
          <button
            onClick={() => setActiveAlarmNotification(null)}
            className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold shrink-0 hover:bg-zinc-900"
          >
            {state.language === 'fa' ? 'متوجه شدم' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <Header
        language={state.language}
        theme={state.theme}
        onToggleLanguage={handleToggleLanguage}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Area */}
      <main className="min-h-[calc(100vh-64px-64px)]">
        {currentTab === 'dashboard' && (
          <DashboardView
            state={state}
            onUpdateTask={handleUpdateTask}
            onUpdateActivity={handleUpdateActivity}
            onIncrementLesson={handleIncrementLesson}
            onNavigateToTab={setCurrentTab}
            onOpenQuickAdd={(type) => setQuickAddType(type)}
          />
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            state={state}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            state={state}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {currentTab === 'learning' && (
          <LearningView
            state={state}
            onUpdateCourse={handleUpdateCourse}
            onUpdateElectronics={handleUpdateElectronics}
            onAddExperiment={handleAddExperiment}
            onUpdateSchoolSubjects={handleUpdateSchoolSubjects}
            onUpdateEntertainment={handleUpdateEntertainment}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            state={state}
            onSaveReport={handleSaveReport}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            state={state}
            onUpdateLanguage={handleUpdateLanguage}
            onUpdateTheme={handleUpdateTheme}
            onRestoreState={handleRestoreState}
            onResetState={handleResetState}
          />
        )}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={state.language}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        state={state}
        onNavigateToTab={setCurrentTab}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddType !== null}
        type={quickAddType}
        onClose={() => setQuickAddType(null)}
        state={state}
        onAddReminder={handleAddReminder}
        onAddTask={handleAddTask}
        onAddActivity={handleAddActivity}
        onLogSession={handleLogStudySession}
      />
    </div>
  );
}
