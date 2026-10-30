# My Planner (برنامه شخصی من) - Personal Planner & Learning Tracker

A production-quality native Android-experience application featuring an AMOLED dark aesthetic, complete Persian (RTL, Saturday-start) and English (LTR) bilingual localization, interactive weekly scheduling, smart notification/reminder engine, course backlog tracker (AI Python & Techno Sharif Math), electronics self-study roadmap, weekly progress reports, and an integrated Android Studio Kotlin + Jetpack Compose project exporter.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1 interactive review and will govern the implementation:

- **Confirmed Delivery Format**: A fully functional interactive Android-styled application with Material 3 AMOLED Dark styling, backed by persistent offline storage (`IndexedDB` / `localStorage` acting as the Room DB mirror), alongside a dedicated **"Android Studio Project Exporter"** tab/modal containing the complete, ready-to-build native Kotlin source files (Room entities & DAOs, ViewModels, Repository pattern, Compose UI screens, Hilt DI modules, AndroidManifest, Gradle files, and Persian/English string resources).
- **Confirmed Default Language & Calendar**: Defaults to **Persian (فارسی)** with full RTL layout, Persian numerals/dates, and Saturday-first weekly calendar, with instant 1-tap switching to English (LTR, Gregorian, customizable week start).
- **Confirmed Pre-loaded Data**: Pre-loaded on first launch with:
  - **AI Python Course**: 32 total lessons, 6 completed, 26 remaining, weekly target of 4 recorded lessons, 2 new lessons released weekly (net backlog reduction: ~2/wk).
  - **Techno Sharif Mathematics Course**: 6 remaining lessons, weekly target of 1 lesson, 1 lesson released every 2 weeks (net reduction: ~0.5/wk).
  - **Electronics Roadmap**: 6 official textbooks/modules (Basic Technical Knowledge, Electrical & Electronic Components, Technical Physics, Computer-Aided Technical Drawing, PCB Design, Student Companion) with study logs and practical experiment tracking.

---

## 1. Overview & Core Concept

- **What It Does**: A comprehensive personal productivity and learning cockpit specifically tailored for students and self-learners. It seamlessly organizes weekly schedules (school, online lectures, recorded sessions, mosque, sports), manages course backlog dynamics with predictive completion estimates, provides an electronics engineering study tracker, schedules notifications/reminders, and generates comprehensive Persian & English weekly performance reports.
- **Target Audience / Persona**: High-school and vocational technical students, self-taught engineers, and lifelong learners balancing formal school, online recorded courses, technical self-study, and extracurricular habits.
- **Key Value**: Eliminates the anxiety of course backlogs through accurate net-rate calculations, offers distraction-free AMOLED dark ergonomics, and works 100% offline with zero data leakage.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard & Daily Command**: The user opens the app to an AMOLED black screen. At a glance, they view today's Jalali/Gregorian date, day progress ring, upcoming activities, pending urgent tasks, active course backlog status cards, and quick-action bottom sheet triggers (`+ Task`, `+ Reminder`, `+ Study Session`, `+ Activity`).
2. **Weekly Schedule (Saturday–Friday)**: Fully interactive 7-day grid and day-by-day timeline. Users tap any time slot to add/edit activities across categories (School, Recorded Courses, Online Classes, Electronics, Sports, Mosque, Homework, Exams, Rest). Supports marking activities as Planned, Completed, Skipped, or Rescheduled.
3. **Course Backlog & Learning**: Visual cards for AI Python and Techno Sharif Math. Shows current backlog, completion rate, new lesson release pace, and computed estimated completion date. Users log completed recorded lessons or switch into the live-session phase (AI: 2 sessions/wk, Math: 1 session/wk).
4. **Electronics Self-Study Roadmap**: Interactive exploration of the 6 core vocational textbooks. Users mark chapters/topics completed, log 40–45 minute study sessions, record practical experiments with schematics notes, and track cumulative study hours.
5. **Smart Reminders**: Precise alarms and notifications. Users create one-time or recurring (daily, weekly, biweekly) reminders with custom priority, vibration toggles, and snooze/postpone workflows. Features in-browser Audio/Notification API triggers with permission request handling.
6. **Weekly Report & Export**: Generates formatted weekly summaries in Persian and English (metrics, completed lessons, backlog deltas, most productive day, obstacles, and notes). Provides 1-click clipboard copy, PDF export via print stylesheet, and JSON backup/restore.
7. **Native Android Source Code Viewer & Exporter**: A dedicated developer panel that displays and allows downloading/copying the complete native Android Kotlin code (Room DB, DAOs, Hilt DI, Jetpack Compose screens, ViewModels, AlarmManager/WorkManager helpers, and `strings.xml`).

### Visual Identity & Theme

- **Aesthetic Direction**: AMOLED Dark Material 3 with tactile mobile ergonomics. Deep pitch-black background (#090909) saving battery and reducing eye strain, layered dark gray cards (#151515), subtle hairline borders (#262626), and radiant Gold (#FFC107) and Amber (#FFA000) accents.
- **Typography & Localization**:
  - Persian font stack: Vazirmatn / Tahoma / system Persian sans-serif with RTL directionality and Persian tabular numerals.
  - English font stack: Plus Jakarta Sans / system sans-serif with LTR alignment.
  - Strict 60-30-10 color allocation: 60% neutral black, 30% card surfaces and dividers, 10% gold/amber interactive highlights.
- **Touch Ergonomics**: All buttons and list rows meet the $\ge 44 \times 44\text{px}$ touch target requirement. Sticky 6-tab bottom navigation bar (`Dashboard`, `Schedule`, `Tasks`, `Learning`, `Reports`, `Settings`) adhering to the 15% viewport height cap.

---

## 3. Key Product Decisions & Trade-Offs

- **Dual Mode: Interactive App + Native Kotlin Project**:
  - *Chosen Approach*: Deliver both an instantly testable, rich interactive Android-feel application inside AI Studio (running React, Tailwind CSS, Motion, LocalStorage/IndexedDB) AND a complete, modular, compilable Kotlin Android Studio source codebase accessible via an in-app Export/Code Viewer.
  - *Why*: The user gets immediate interactive verification in their browser while simultaneously receiving production-grade Kotlin Jetpack Compose source files ready to be pasted or imported into Android Studio for an APK release.
- **Client-Side Offline Persistence**:
  - *Chosen Approach*: Fully client-side storage with automated JSON import/export, schema versioning, and validation.
  - *Why*: Satisfies the strict requirement: "The app must work completely offline. Internet access must not be required for normal functionality."
- **Backlog Mathematics Engine**:
  - *Chosen Approach*: $\Delta_{\text{Backlog}} = \text{Completed} - (\text{WeeksElapsed} \times \text{ReleaseRate})$. Real-time calculations with fraction support (0.5 lesson/wk for bi-weekly math releases) and remaining weeks estimation.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        My Planner (UI Shell)                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Mobile Frame / Responsive AMOLED Container (Persian RTL / EN LTR)│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                    │
│   ┌───────────────────────────────┴───────────────────────────────┐    │
│   ▼                               ▼                               ▼    │
│ [Dashboard View]         [Weekly Schedule]              [Learning View]│
│ - Today Ring & Stats     - Sat-Fri Calendar Grid        - AI Course    │
│ - Pending Tasks & Alarms - Activity Color Tags          - Math Course  │
│ - Quick Action Sheets    - Status Transitions           - Electronics  │
│   ┌───────────────────────────────┬───────────────────────────────┐    │
│   ▼                               ▼                               ▼    │
│ [Tasks & Habits]         [Weekly Reports & Stats]       [Settings & DB]│
│ - Priorities & Search    - Auto-generated Summary       - JSON Backup  │
│ - Daily/Weekly Checks    - PDF / Clipboard Export       - RTL / Theme  │
│ - Streaks & Goals        - Analytics Charts             - Kotlin Code  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       [Local Repository / State]       [Android Kotlin Module]
       - Courses & Backlog Engine       - Room Entities & DAOs
       - Schedule & Activity Engine     - Compose UI Screens
       - Reminder / WebAudio Engine     - Hilt DI & ViewModels
       - Backup / Restore Validator     - WorkManager / Alarms
```

### Data Model Entities

- `Course`: id, name, instructor, totalLessons, completedLessons, weeklyTarget, releaseRatePerWeek, type (recorded/live/self-study), description, isLivePhase, liveSessionsPerWeek.
- `ScheduleActivity`: id, title, dayOfWeek (0=Saturday to 6=Friday), startTime, endTime, category (School, Recorded, Online, Electronics, Sports, Mosque, Homework, Exam, Entertainment, Rest, Personal), status (planned, completed, skipped, rescheduled), description, color.
- `TaskItem`: id, title, description, category, priority (low, normal, high, urgent), dueDate, dueTime, status (pending, completed, postponed, cancelled), isHabit, streak.
- `ReminderItem`: id, title, description, triggerTime, recurrence (none, daily, weekly, biweekly), priority, soundEnabled, vibrateEnabled, isSnoozed, isCompleted.
- `ElectronicsResource`: id, title, persianTitle, totalChapters, completedChapters, studyMinutesLogged, experimentsCount, notes.
- `WeeklyReport`: id, weekStartDate, aiCompleted, mathCompleted, electronicsCompleted, tasksCompleted, tasksPostponed, scheduleCompletionRate, totalStudyMinutes, notesPersian, obstaclePersian.

### Interactive Component & State Mapping

- **Language & Direction**: Dynamic `dir="rtl"` or `dir="ltr"` attribute switching on root with complete translation dictionaries (`fa` and `en`) for all strings.
- **Audio & Alarm Engine**: Uses Web Audio API synthetic notification chimes and browser Notification API when permitted, with visual in-app banner fallback.
- **Export & Backup Engine**: Seamless export to clean JSON with hash verification, and printable PDF styling for weekly reports.
