import { AppState, Course, ElectronicsResource, ScheduleActivity, TaskItem, ReminderItem, SchoolSubject, HabitGoal, EntertainmentItem } from '../types';

const STORAGE_KEY = 'my_planner_app_state_v1';

export const initialCourses: Course[] = [
  {
    id: 'course-ai-python',
    name: 'AI Python (پایتون و یادگیری هوش مصنوعی)',
    instructor: 'دکتر / استاد هوش مصنوعی',
    totalLessons: 32,
    completedLessons: 6,
    weeklyTarget: 4,
    newLessonsPerWeek: 2,
    courseType: 'recorded',
    description: 'دوره جامع برنامه‌نویسی پایتون، تحلیل داده، کتابخانه‌های NumPy، Pandas و شبکه‌های عصبی',
    isLivePhase: false,
    liveSessionsPerWeek: 2,
    color: '#FFC107',
  },
  {
    id: 'course-math-techno-sharif',
    name: 'Techno Sharif Mathematics (ریاضی تکنو شریف)',
    instructor: 'مدرسان تکنو شریف',
    totalLessons: 12,
    completedLessons: 6,
    weeklyTarget: 1,
    newLessonsPerWeek: 0.5, // 1 lesson every 2 weeks
    courseType: 'recorded',
    description: 'مفاهیم پایه تا پیشرفته حسابان، جبر خطی و ریاضیات کاربردی مهندسی',
    isLivePhase: false,
    liveSessionsPerWeek: 1,
    color: '#FFA000',
  },
];

export const initialElectronics: ElectronicsResource[] = [
  {
    id: 'res-1',
    titleEn: 'Basic Technical Knowledge',
    titleFa: 'دانش فنی پایه',
    totalChapters: 5,
    completedChapters: 2,
    studyMinutesLogged: 135,
    chapters: [
      { id: 'c1-1', title: 'فصل اول: ایمنی و بهداشت در کارگاه الکترونیک', completed: true },
      { id: 'c1-2', title: 'فصل دوم: کمیت‌ها و واحدهای الکتریکی', completed: true },
      { id: 'c1-3', title: 'فصل سوم: قوانین اهم و کیرشُف', completed: false },
      { id: 'c1-4', title: 'فصل چهارم: کار با مولتی‌متر و ابزارهای اندازه‌گیری', completed: false },
      { id: 'c1-5', title: 'فصل پنجم: توان و انرژی الکتریکی', completed: false },
    ],
    notes: 'نیاز به مرور قوانین کیرشُف در مدارهای ترکیبی',
    bookmark: 'صفحه ۴۵ - قانون جریان کیرشُف (KCL)',
  },
  {
    id: 'res-2',
    titleEn: 'Electrical and Electronic Components',
    titleFa: 'عرضه تخصصی قطعات الکتریکی و الکترونیکی',
    totalChapters: 6,
    completedChapters: 1,
    studyMinutesLogged: 90,
    chapters: [
      { id: 'c2-1', title: 'پودمان ۱: مقاومت‌ها و خازن‌ها (کدگذاری و تست)', completed: true },
      { id: 'c2-2', title: 'پودمان ۲: دیودها و یکسوسازها', completed: false },
      { id: 'c2-3', title: 'پودمان ۳: ترانزیستورهای BJT و مدار بایاس', completed: false },
      { id: 'c2-4', title: 'پودمان ۴: ترانزیستورهای اثر میدان (MOSFET)', completed: false },
      { id: 'c2-5', title: 'پودمان ۵: قطعات تریستوری و اپتوکوپلر', completed: false },
      { id: 'c2-6', title: 'پودمان ۶: آی‌سی‌های خطی و تایمر 555', completed: false },
    ],
    notes: 'آشنایی با تست دیود و ترانزیستور با تست بازر مولتی‌متر',
  },
  {
    id: 'res-3',
    titleEn: 'Technical Physics',
    titleFa: 'فیزیک فنی',
    totalChapters: 4,
    completedChapters: 1,
    studyMinutesLogged: 45,
    chapters: [
      { id: 'c3-1', title: 'فصل ۱: اندازه‌گیری و بردارها', completed: true },
      { id: 'c3-2', title: 'فصل ۲: حرکت و دینامیک', completed: false },
      { id: 'c3-3', title: 'فصل ۳: الکتریسیته ساکن و میدان الکتریکی', completed: false },
      { id: 'c3-4', title: 'فصل ۴: مغناطیس و القای الکترومغناطیسی', completed: false },
    ],
  },
  {
    id: 'res-4',
    titleEn: 'Computer-Aided Technical Drawing',
    titleFa: 'نقشه‌کشی فنی رایانه‌ای',
    totalChapters: 5,
    completedChapters: 1,
    studyMinutesLogged: 45,
    chapters: [
      { id: 'c4-1', title: 'محیط کاری نرم‌افزار ترسیم و اصول رسم فنی', completed: true },
      { id: 'c4-2', title: 'ترسیم دیاگرام‌های شماتیک الکترونیک', completed: false },
      { id: 'c4-3', title: 'علائم استاندارد مدارهای الکتریکی', completed: false },
      { id: 'c4-4', title: 'ترسیم مدارچاپی یک‌رو', completed: false },
      { id: 'c4-5', title: 'خروجی‌های استاندارد گربر و ساخت', completed: false },
    ],
  },
  {
    id: 'res-5',
    titleEn: 'PCB Design and Manufacturing',
    titleFa: 'طراحی و ساخت مدارهای چاپی',
    totalChapters: 4,
    completedChapters: 0,
    studyMinutesLogged: 0,
    chapters: [
      { id: 'c5-1', title: 'آشنایی با بردهای مدار چاپی و استانداردهای IPC', completed: false },
      { id: 'c5-2', title: 'طراحی برد با نرم‌افزار Altium / EasyEDA', completed: false },
      { id: 'c5-3', title: 'روش‌های لامینت و اسیدکاری دستی', completed: false },
      { id: 'c5-4', title: 'لحیم‌کاری قطعات SMD و DIP', completed: false },
    ],
  },
  {
    id: 'res-6',
    titleEn: 'Student Companion',
    titleFa: 'همراه هنرجو',
    totalChapters: 6,
    completedChapters: 2,
    studyMinutesLogged: 90,
    chapters: [
      { id: 'c6-1', title: 'جداول استاندارد قطعات و پایه‌های ترانزیستور', completed: true },
      { id: 'c6-2', title: 'فرمول‌های کلیدی الکترونیک و تلورانس مقاومت', completed: true },
      { id: 'c6-3', title: 'جدول معادل آی‌سی‌ها و رگولاتورها', completed: false },
      { id: 'c6-4', title: 'راه‌اندازی ماژول‌های پرکاربرد', completed: false },
      { id: 'c6-5', title: 'راهنمای عیب‌یابی مدارهای تغذیه', completed: false },
      { id: 'c6-6', title: 'پروژه‌های کاربردی کارگاهی', completed: false },
    ],
  },
];

export const initialActivities: ScheduleActivity[] = [
  // Saturday (Day 0)
  {
    id: 'act-1',
    title: 'کلاس مدرسه (درس ریاضی و فیزیک)',
    dayOfWeek: 0,
    startTime: '07:30',
    endTime: '12:30',
    category: 'school',
    status: 'completed',
    isRecurringWeekly: true,
  },
  {
    id: 'act-2',
    title: 'نماز ظهر و مسجد',
    dayOfWeek: 0,
    startTime: '12:45',
    endTime: '13:30',
    category: 'mosque',
    status: 'completed',
    isRecurringWeekly: true,
  },
  {
    id: 'act-3',
    title: 'مطالعه آفلاین پایتون و هوش مصنوعی (جلسه ۷)',
    dayOfWeek: 0,
    startTime: '16:00',
    endTime: '17:30',
    category: 'recorded',
    status: 'planned',
    isRecurringWeekly: true,
  },
  // Sunday (Day 1)
  {
    id: 'act-4',
    title: 'کلاس مدرسه',
    dayOfWeek: 1,
    startTime: '07:30',
    endTime: '12:30',
    category: 'school',
    status: 'planned',
    isRecurringWeekly: true,
  },
  {
    id: 'act-5',
    title: 'خودآموزی الکترونیک (جلسه اول هفتگی)',
    dayOfWeek: 1,
    startTime: '16:30',
    endTime: '17:15',
    category: 'electronics',
    status: 'planned',
    description: 'مطالعه فصل ۳ قطعات: تست ترانزیستور',
    isRecurringWeekly: true,
  },
  {
    id: 'act-6',
    title: 'ورزش و تمرین بدنسازی',
    dayOfWeek: 1,
    startTime: '18:30',
    endTime: '19:45',
    category: 'sports',
    status: 'planned',
    isRecurringWeekly: true,
  },
  // Monday (Day 2)
  {
    id: 'act-7',
    title: 'دوره ریاضی تکنو شریف (جلسه ۷)',
    dayOfWeek: 2,
    startTime: '17:00',
    endTime: '18:15',
    category: 'recorded',
    status: 'planned',
    isRecurringWeekly: true,
  },
  // Tuesday (Day 3)
  {
    id: 'act-8',
    title: 'خودآموزی الکترونیک (جلسه دوم هفتگی)',
    dayOfWeek: 3,
    startTime: '16:30',
    endTime: '17:15',
    category: 'electronics',
    status: 'planned',
    isRecurringWeekly: true,
  },
  {
    id: 'act-9',
    title: 'مطالعه پایتون هوش مصنوعی (جلسه ۸)',
    dayOfWeek: 3,
    startTime: '17:30',
    endTime: '19:00',
    category: 'recorded',
    status: 'planned',
    isRecurringWeekly: true,
  },
  // Wednesday (Day 4)
  {
    id: 'act-10',
    title: 'انجام تکالیف مدرسه و پروژه‌های هفتگی',
    dayOfWeek: 4,
    startTime: '16:00',
    endTime: '18:00',
    category: 'homework',
    status: 'planned',
    isRecurringWeekly: true,
  },
  // Thursday (Day 5)
  {
    id: 'act-11',
    title: 'تمرین ورزشی و فوتبال',
    dayOfWeek: 5,
    startTime: '10:00',
    endTime: '12:00',
    category: 'sports',
    status: 'planned',
    isRecurringWeekly: true,
  },
  {
    id: 'act-12',
    title: 'مطالعه پایتون هوش مصنوعی (جلسه ۹)',
    dayOfWeek: 5,
    startTime: '16:00',
    endTime: '17:30',
    category: 'recorded',
    status: 'planned',
    isRecurringWeekly: true,
  },
  // Friday (Day 6)
  {
    id: 'act-13',
    title: 'نماز جمعه و مسجد',
    dayOfWeek: 6,
    startTime: '11:30',
    endTime: '13:30',
    category: 'mosque',
    status: 'planned',
    isRecurringWeekly: true,
  },
  {
    id: 'act-14',
    title: 'تهیه و ثبت گزارش پیشرفت هفتگی',
    dayOfWeek: 6,
    startTime: '18:00',
    endTime: '19:00',
    category: 'personal',
    status: 'planned',
    isRecurringWeekly: true,
  },
  {
    id: 'act-15',
    title: 'تماشای فیلم یا بازی (تفریح پایان هفته)',
    dayOfWeek: 6,
    startTime: '20:30',
    endTime: '22:30',
    category: 'entertainment',
    status: 'planned',
    isRecurringWeekly: true,
  },
];

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'مشاهده جلسه ۷ دوره پایتون هوش مصنوعی',
    description: 'کار با آرایه‌های چندبعدی در NumPy و توابع جبر خطی',
    category: 'recorded',
    priority: 'urgent',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:30',
    status: 'pending',
    hasReminder: true,
  },
  {
    id: 'task-2',
    title: 'تکمیل تمرین‌های درس ۲ فیزیک فنی',
    description: 'حل ۱۰ سوال پایانی فصل حرکت یکنواخت',
    category: 'homework',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '20:00',
    status: 'pending',
  },
  {
    id: 'task-3',
    title: 'تست دیود زنر با مولتی‌متر روی بِردبُرد',
    description: 'اندازه‌گیری ولتاژ شکست دیود زنر ۵.۱ ولتی',
    category: 'electronics',
    priority: 'normal',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    status: 'completed',
    completedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'مرور جزوه ریاضی تکنو شریف (فصل توابع نمایی)',
    category: 'recorded',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '19:00',
    status: 'pending',
  },
  {
    id: 'task-5',
    title: 'آماده‌سازی مدار منبع تغذیه ۵ ولت رگوله شده',
    category: 'electronics',
    priority: 'normal',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    status: 'pending',
  },
];

export const initialReminders: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'شروع کلاس آفلاین هوش مصنوعی (جلسه ۷)',
    description: 'آماده کردن نوت‌بوک ژوپیتر و کدنویسی همزمان',
    dateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    recurrence: 'daily',
    priority: 'urgent',
    soundEnabled: true,
    vibrateEnabled: true,
    isCompleted: false,
  },
  {
    id: 'rem-2',
    title: 'جلسه خودآموزی الکترونیک (۴۵ دقیقه)',
    description: 'بررسی کتاب قطعات و ساخت مدار تست BJT',
    dateTime: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
    recurrence: 'weekly',
    priority: 'high',
    soundEnabled: true,
    vibrateEnabled: true,
    isCompleted: false,
  },
  {
    id: 'rem-3',
    title: 'ارسال گزارش پیشرفت هفتگی',
    description: 'بررسی جلسات تکمیل‌شده پایتون، ریاضی و الکترونیک',
    dateTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    recurrence: 'weekly',
    priority: 'normal',
    soundEnabled: true,
    vibrateEnabled: true,
    isCompleted: false,
  },
];

export const initialSchoolSubjects: SchoolSubject[] = [
  {
    id: 'sub-1',
    name: 'ریاضیات و حسابان',
    teacher: 'استاد حسینی',
    homework: [
      { id: 'hw-1', title: 'تمرین‌های صفحه ۵۲ کتاب حسابان', dueDate: '2026-11-02', completed: false }
    ],
    exams: [
      { id: 'ex-1', title: 'میان‌ترم اول حسابان', date: '2026-11-15' }
    ]
  },
  {
    id: 'sub-2',
    name: 'فیزیک فنی',
    teacher: 'مهندس رضایی',
    homework: [
      { id: 'hw-2', title: 'حل مسائل دینامیک و بردارها', dueDate: '2026-11-03', completed: true }
    ],
    exams: [
      { id: 'ex-2', title: 'کوییز فصل دوم فیزیک', date: '2026-11-08' }
    ]
  },
  {
    id: 'sub-3',
    name: 'کارگاه مدار چاپی و الکترونیک',
    teacher: 'مهندس احمدی',
    homework: [],
    exams: []
  }
];

export const initialHabits: HabitGoal[] = [
  {
    id: 'hab-1',
    title: 'مشاهده ۴ درس پایتون در هفته',
    targetPerWeek: 4,
    completedThisWeek: 3,
    streakWeeks: 3,
    unit: 'جلسه',
    category: 'study'
  },
  {
    id: 'hab-2',
    title: 'مطالعه ۲ جلسه الکترونیک (۴۵ دقیقه)',
    targetPerWeek: 2,
    completedThisWeek: 2,
    streakWeeks: 4,
    unit: 'جلسه',
    category: 'study'
  },
  {
    id: 'hab-3',
    title: 'تمرین ورزشی ۳ بار در هفته',
    targetPerWeek: 3,
    completedThisWeek: 2,
    streakWeeks: 2,
    unit: 'جلسه',
    category: 'sports'
  },
  {
    id: 'hab-4',
    title: 'خواب منظم قبل از ساعت ۱۱:۳۰ شب',
    targetPerWeek: 7,
    completedThisWeek: 5,
    streakWeeks: 1,
    unit: 'شب',
    category: 'health'
  }
];

export const initialEntertainment: EntertainmentItem[] = [
  {
    id: 'ent-1',
    title: 'تماشای فیلم مستند هوش مصنوعی AlphaGo',
    type: 'movie',
    durationMinutes: 90,
    completed: true
  },
  {
    id: 'ent-2',
    title: 'بازی شطرنج آنلاین (۳ دست)',
    type: 'gaming',
    durationMinutes: 45,
    completed: false
  }
];

export const initialReports = [
  {
    id: 'rep-prev-1',
    weekRange: 'هفته گذشته (۲ تا ۸ آبان)',
    createdAt: '2026-10-24T18:00:00Z',
    aiCompleted: 4,
    aiTarget: 4,
    mathCompleted: 1,
    mathTarget: 1,
    electronicsSessions: 2,
    electronicsTarget: 2,
    electronicsMinutes: 90,
    tasksCompleted: 14,
    tasksPostponed: 2,
    scheduleCompletionRate: 92,
    mostProductiveDay: 'سه‌شنبه',
    mainObstacle: 'کمبود زمان در روز پنج‌شنبه به علت کارگاه',
    notes: 'تمام اهداف درسی هوش مصنوعی و الکترونیک پوشش داده شدند.',
    schoolStatus: 'تکالیف حسابان و فیزیک به موقع تحویل داده شد.'
  }
];

export const defaultState: AppState = {
  language: 'fa',
  theme: 'amoled',
  firstDayOfWeek: 0, // Saturday
  courses: initialCourses,
  scheduleActivities: initialActivities,
  tasks: initialTasks,
  reminders: initialReminders,
  electronicsResources: initialElectronics,
  schoolSubjects: initialSchoolSubjects,
  entertainmentItems: initialEntertainment,
  habits: initialHabits,
  experiments: [
    {
      id: 'exp-1',
      title: 'مدار یکسوساز پل با دیود 1N4007 و فیلتر خازنی',
      date: '2026-10-20',
      notes: 'ریپل ولتاژ خروجی با خازن ۱۰۰۰ میکروفاراد بررسی شد؛ شکل موج خروجی بسیار صاف بود.',
      completed: true,
    }
  ],
  weeklyReports: initialReports,
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
    };
  } catch {
    return defaultState;
  }
}

export function saveAppState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}
