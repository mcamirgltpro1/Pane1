export type Language = 'fa' | 'en';
export type ThemeMode = 'amoled' | 'dark' | 'light';

export type ActivityCategory = 
  | 'school' 
  | 'recorded' 
  | 'online' 
  | 'electronics' 
  | 'sports' 
  | 'mosque' 
  | 'homework' 
  | 'exams' 
  | 'entertainment' 
  | 'rest' 
  | 'personal';

export type ActivityStatus = 'planned' | 'completed' | 'skipped' | 'rescheduled';

export interface ScheduleActivity {
  id: string;
  title: string;
  dayOfWeek: number; // 0 = Saturday, 1 = Sunday, ..., 6 = Friday
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  category: ActivityCategory;
  status: ActivityStatus;
  description?: string;
  color?: string;
  isRecurringWeekly?: boolean;
  isRecurringBiweekly?: boolean;
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'completed' | 'postponed' | 'cancelled';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  status: TaskStatus;
  repeatInterval?: 'none' | 'daily' | 'weekly';
  hasReminder?: boolean;
  reminderTime?: string;
  isHabit?: boolean;
  streak?: number;
  completedAt?: string;
}

export type CourseType = 'recorded' | 'online' | 'self_study' | 'school' | 'practical';

export interface Course {
  id: string;
  name: string;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  weeklyTarget: number;
  newLessonsPerWeek: number; // e.g. 2 for AI, 0.5 for Math
  courseType: CourseType;
  description: string;
  isLivePhase: boolean;
  liveSessionsPerWeek: number;
  liveSessionDurationMinutes?: number;
  color: string;
}

export interface Chapter {
  id: string;
  title: string;
  completed: boolean;
}

export interface PracticalExperiment {
  id: string;
  title: string;
  date: string;
  notes: string;
  completed: boolean;
}

export interface ElectronicsResource {
  id: string;
  titleEn: string;
  titleFa: string;
  totalChapters: number;
  completedChapters: number;
  studyMinutesLogged: number;
  chapters: Chapter[];
  notes?: string;
  bookmark?: string;
}

export type ReminderRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'custom';
export type ReminderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string or YYYY-MM-DDTHH:MM
  recurrence: ReminderRecurrence;
  priority: ReminderPriority;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  isCompleted: boolean;
  snoozedUntil?: string;
}

export interface SchoolSubject {
  id: string;
  name: string;
  teacher?: string;
  notes?: string;
  homework: {
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }[];
  exams: {
    id: string;
    title: string;
    date: string;
    score?: number;
  }[];
}

export interface EntertainmentItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'gaming' | 'reading' | 'other';
  durationMinutes?: number;
  scheduledTime?: string;
  completed: boolean;
  notes?: string;
}

export interface HabitGoal {
  id: string;
  title: string;
  targetPerWeek: number;
  completedThisWeek: number;
  streakWeeks: number;
  unit: string;
  category: 'study' | 'sports' | 'health' | 'personal';
}

export interface WeeklyReportData {
  id: string;
  weekRange: string;
  createdAt: string;
  aiCompleted: number;
  aiTarget: number;
  mathCompleted: number;
  mathTarget: number;
  electronicsSessions: number;
  electronicsTarget: number;
  electronicsMinutes: number;
  tasksCompleted: number;
  tasksPostponed: number;
  scheduleCompletionRate: number;
  mostProductiveDay: string;
  mainObstacle: string;
  notes: string;
  schoolStatus: string;
}

export interface AppState {
  language: Language;
  theme: ThemeMode;
  firstDayOfWeek: number; // 0 = Saturday, 1 = Sunday, 2 = Monday
  courses: Course[];
  scheduleActivities: ScheduleActivity[];
  tasks: TaskItem[];
  reminders: ReminderItem[];
  electronicsResources: ElectronicsResource[];
  schoolSubjects: SchoolSubject[];
  entertainmentItems: EntertainmentItem[];
  habits: HabitGoal[];
  experiments: PracticalExperiment[];
  weeklyReports: WeeklyReportData[];
}
