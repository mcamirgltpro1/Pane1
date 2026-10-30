export interface AndroidFile {
  path: string;
  category: string;
  description: string;
  content: string;
}

export const androidProjectFiles: AndroidFile[] = [
  {
    path: 'app/build.gradle.kts',
    category: 'Build & Config',
    description: 'App-level Gradle script with Jetpack Compose, Room, Hilt, and WorkManager',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.planner.myplanner"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.planner.myplanner"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with release signing
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Jetpack Compose BOM & Material 3
    val composeBom = platform("androidx.compose:compose-bom:2024.04.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    kapt("androidx.room:room-compiler:$roomVersion")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Dependency Injection (Hilt)
    implementation("com.google.dagger:hilt-android:2.51.1")
    kapt("com.google.dagger:hilt-android-compiler:2.51.1")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // WorkManager & DataStore
    implementation("androidx.work:work-runtime-ktx:2.9.0")
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.0")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'Manifest',
    description: 'Android Manifest with RTL support, exact alarm and notification permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Essential Offline & Notification Permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".MyPlannerApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MyPlanner">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.MyPlanner"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Alarm Receiver for Exact Scheduled Reminders -->
        <receiver
            android:name=".notifications.AlarmReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="com.planner.myplanner.ACTION_TRIGGER_REMINDER" />
            </intent-filter>
        </receiver>

        <!-- Boot Receiver to Re-schedule Alarms after Device Restart -->
        <receiver
            android:name=".notifications.BootReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
                <action android:name="android.intent.action.TIME_SET" />
            </intent-filter>
        </receiver>

    </application>

</manifest>
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/data/database/CourseEntity.kt',
    category: 'Database & Entities',
    description: 'Room Entity for Course Backlogs & Online phases',
    content: `package com.planner.myplanner.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "courses")
data class CourseEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val instructor: String,
    val totalLessons: Int,
    val completedLessons: Int,
    val weeklyTarget: Int,
    val newLessonsPerWeek: Double, // 2.0 for AI, 0.5 for Math
    val courseType: String,        // RECORDED, ONLINE, SELF_STUDY
    val description: String,
    val isLivePhase: Boolean = false,
    val liveSessionsPerWeek: Int = 0,
    val colorHex: String = "#FFC107"
) {
    val remainingLessons: Int
        get() = maxOf(0, totalLessons - completedLessons)

    val progressPercent: Int
        get() = if (totalLessons > 0) ((completedLessons.toFloat() / totalLessons) * 100).toInt() else 0

    val netWeeklyBacklogReduction: Double
        get() = weeklyTarget - newLessonsPerWeek

    val estimatedWeeksToComplete: Int
        get() {
            if (remainingLessons == 0) return 0
            if (netWeeklyBacklogReduction <= 0) return 999
            return kotlin.math.ceil(remainingLessons / netWeeklyBacklogReduction).toInt()
        }
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/data/database/ActivityEntity.kt',
    category: 'Database & Entities',
    description: 'Room Entity for Weekly Schedule Activities',
    content: `package com.planner.myplanner.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "schedule_activities")
data class ActivityEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val dayOfWeek: Int, // 0=Saturday, 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday
    val startTime: String, // "08:30"
    val endTime: String,   // "10:00"
    val category: String,  // SCHOOL, RECORDED, ONLINE, ELECTRONICS, SPORTS, MOSQUE, HOMEWORK, EXAMS, ENTERTAINMENT, REST, PERSONAL
    val status: String,    // PLANNED, COMPLETED, SKIPPED, RESCHEDULED
    val description: String = "",
    val isRecurringWeekly: Boolean = true,
    val isRecurringBiweekly: Boolean = false
)
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/data/database/TaskEntity.kt',
    category: 'Database & Entities',
    description: 'Room Entity for Daily & Weekly Tasks with Priority',
    content: `package com.planner.myplanner.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String = "",
    val category: String,
    val priority: String, // LOW, NORMAL, HIGH, URGENT
    val dueDate: String,   // "2026-11-01"
    val dueTime: String? = null,
    val status: String = "PENDING", // PENDING, COMPLETED, POSTPONED, CANCELLED
    val repeatInterval: String = "NONE", // NONE, DAILY, WEEKLY
    val hasReminder: Boolean = false,
    val isHabit: Boolean = false,
    val streak: Int = 0,
    val completedAt: Long? = null
)
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/data/database/ReminderEntity.kt',
    category: 'Database & Entities',
    description: 'Room Entity for Exact Scheduled Reminders',
    content: `package com.planner.myplanner.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reminders")
data class ReminderEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String = "",
    val triggerTimeEpoch: Long,
    val recurrence: String = "NONE", // NONE, DAILY, WEEKLY, BIWEEKLY
    val priority: String = "NORMAL", // LOW, NORMAL, HIGH, URGENT
    val soundEnabled: Boolean = true,
    val vibrateEnabled: Boolean = true,
    val isCompleted: Boolean = false
)
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/data/dao/PlannerDao.kt',
    category: 'Database & Entities',
    description: 'Room Data Access Object (DAO) with Flow & Coroutines',
    content: `package com.planner.myplanner.data.dao

import androidx.room.*
import com.planner.myplanner.data.database.*
import kotlinx.coroutines.flow.Flow

@Dao
interface PlannerDao {

    // Courses & Backlog
    @Query("SELECT * FROM courses")
    fun getAllCourses(): Flow<List<CourseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateCourse(course: CourseEntity)

    @Query("UPDATE courses SET completedLessons = completedLessons + 1 WHERE id = :courseId")
    suspend fun incrementCompletedLessons(courseId: String)

    // Weekly Activities
    @Query("SELECT * FROM schedule_activities ORDER BY startTime ASC")
    fun getAllActivities(): Flow<List<ActivityEntity>>

    @Query("SELECT * FROM schedule_activities WHERE dayOfWeek = :day ORDER BY startTime ASC")
    fun getActivitiesForDay(day: Int): Flow<List<ActivityEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertActivity(activity: ActivityEntity)

    @Delete
    suspend fun deleteActivity(activity: ActivityEntity)

    @Query("UPDATE schedule_activities SET status = :status WHERE id = :id")
    suspend fun updateActivityStatus(id: String, status: String)

    // Tasks
    @Query("SELECT * FROM tasks ORDER BY CASE priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END ASC")
    fun getAllTasks(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE dueDate = :date ORDER BY CASE priority WHEN 'URGENT' THEN 1 ELSE 2 END")
    fun getTasksForDate(date: String): Flow<List<TaskEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskEntity)

    @Delete
    suspend fun deleteTask(task: TaskEntity)

    // Reminders
    @Query("SELECT * FROM reminders WHERE isCompleted = 0 ORDER BY triggerTimeEpoch ASC")
    fun getActiveReminders(): Flow<List<ReminderEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: ReminderEntity)

    @Query("UPDATE reminders SET isCompleted = 1 WHERE id = :id")
    suspend fun markReminderCompleted(id: String)
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/data/database/PlannerDatabase.kt',
    category: 'Database & Entities',
    description: 'Room Database definition with initial database population callback',
    content: `package com.planner.myplanner.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.planner.myplanner.data.dao.PlannerDao
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        CourseEntity::class,
        ActivityEntity::class,
        TaskEntity::class,
        ReminderEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class PlannerDatabase : RoomDatabase() {
    abstract fun plannerDao(): PlannerDao

    companion object {
        @Volatile
        private var INSTANCE: PlannerDatabase? = null

        fun getInstance(context: Context, scope: CoroutineScope): PlannerDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    PlannerDatabase::class.java,
                    "my_planner_database"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(DatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(
            private val scope: CoroutineScope
        ) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateInitialData(database.plannerDao())
                    }
                }
            }

            suspend fun populateInitialData(dao: PlannerDao) {
                // Pre-populate AI Python Course (32 total, 6 completed, target 4, released 2)
                dao.insertOrUpdateCourse(
                    CourseEntity(
                        id = "course-ai-python",
                        name = "AI Python Course",
                        instructor = "AI Instructor",
                        totalLessons = 32,
                        completedLessons = 6,
                        weeklyTarget = 4,
                        newLessonsPerWeek = 2.0,
                        courseType = "RECORDED",
                        description = "Python programming, NumPy, Pandas, Neural Networks",
                        colorHex = "#FFC107"
                    )
                )

                // Pre-populate Techno Sharif Math (12 total, 6 completed, 6 remaining, target 1, released 0.5)
                dao.insertOrUpdateCourse(
                    CourseEntity(
                        id = "course-math-techno-sharif",
                        name = "Techno Sharif Mathematics",
                        instructor = "Sharif Instructors",
                        totalLessons = 12,
                        completedLessons = 6,
                        weeklyTarget = 1,
                        newLessonsPerWeek = 0.5,
                        courseType = "RECORDED",
                        description = "Calculus, Linear Algebra, and Applied Math",
                        colorHex = "#FFA000"
                    )
                )
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/notifications/ReminderAlarmManager.kt',
    category: 'Notifications & Alarms',
    description: 'Precise AlarmManager scheduler with fallback and battery optimization',
    content: `package com.planner.myplanner.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.planner.myplanner.data.database.ReminderEntity

class ReminderAlarmManager(private val context: Context) {
    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    fun scheduleReminder(reminder: ReminderEntity) {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = "com.planner.myplanner.ACTION_TRIGGER_REMINDER"
            putExtra("EXTRA_REMINDER_ID", reminder.id)
            putExtra("EXTRA_REMINDER_TITLE", reminder.title)
            putExtra("EXTRA_REMINDER_DESC", reminder.description)
            putExtra("EXTRA_PRIORITY", reminder.priority)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            reminder.id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerTime = reminder.triggerTimeEpoch
        if (triggerTime <= System.currentTimeMillis()) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager.canScheduleExactAlarms()) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
            } else {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
            }
        } else {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
        }
    }

    fun cancelReminder(reminderId: String) {
        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            reminderId.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/notifications/AlarmReceiver.kt',
    category: 'Notifications & Alarms',
    description: 'BroadcastReceiver triggered by AlarmManager to post heads-up notification',
    content: `package com.planner.myplanner.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.planner.myplanner.MainActivity
import com.planner.myplanner.R

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra("EXTRA_REMINDER_ID") ?: return
        val title = intent.getStringExtra("EXTRA_REMINDER_TITLE") ?: "Reminder"
        val desc = intent.getStringExtra("EXTRA_REMINDER_DESC") ?: ""
        val priority = intent.getStringExtra("EXTRA_PRIORITY") ?: "NORMAL"

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "planner_reminders_channel"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Planner Reminders",
                if (priority == "URGENT") NotificationManager.IMPORTANCE_HIGH else NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Smart notification alerts for scheduled planner activities"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val tapIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingTap = PendingIntent.getActivity(
            context,
            id.hashCode(),
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(desc)
            .setPriority(if (priority == "URGENT") NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingTap)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(id.hashCode(), notification)
    }
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/notifications/BootReceiver.kt',
    category: 'Notifications & Alarms',
    description: 'BroadcastReceiver that re-registers all active alarms when device restarts',
    content: `package com.planner.myplanner.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.planner.myplanner.data.database.PlannerDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == Intent.ACTION_TIMEZONE_CHANGED ||
            intent.action == Intent.ACTION_TIME_CHANGED) {

            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val db = PlannerDatabase.getInstance(context, this)
                    val activeReminders = db.plannerDao().getActiveReminders().first()
                    val scheduler = ReminderAlarmManager(context)

                    activeReminders.forEach { reminder ->
                        if (reminder.triggerTimeEpoch > System.currentTimeMillis()) {
                            scheduler.scheduleReminder(reminder)
                        }
                    }
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/ui/theme/Color.kt',
    category: 'UI & Theme',
    description: 'AMOLED Dark Color Palette & Gold/Amber Accent Tokens',
    content: `package com.planner.myplanner.ui.theme

import androidx.compose.ui.graphics.Color

// AMOLED Dark Theme Palette
val AmoledBackground = Color(0xFF090909)
val AmoledCard = Color(0xFF151515)
val AmoledCardHover = Color(0xFF1C1C1C)
val AmoledBorder = Color(0xFF262626)

// Gold & Amber Accents
val AccentGold = Color(0xFFFFC107)
val AccentAmber = Color(0xFFFFA000)
val AccentAmberDark = Color(0xFFFF8F00)

// Semantic colors
val TextPrimary = Color(0xFFF4F4F5)
val TextSecondary = Color(0xFFA1A1AA)
val StatusSuccess = Color(0xFF22C55E)
val StatusUrgent = Color(0xFFEF4444)
val StatusWarning = Color(0xFFF59E0B)
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/ui/theme/Theme.kt',
    category: 'UI & Theme',
    description: 'Material 3 Dark Theme setup with pure black AMOLED background',
    content: `package com.planner.myplanner.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = AccentGold,
    secondary = AccentAmber,
    tertiary = AccentAmberDark,
    background = AmoledBackground,
    surface = AmoledCard,
    onPrimary = AmoledBackground,
    onSecondary = AmoledBackground,
    onBackground = TextPrimary,
    onSurface = TextPrimary
)

@Composable
fun MyPlannerTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
`
  },
  {
    path: 'app/src/main/java/com/planner/myplanner/ui/screens/DashboardScreen.kt',
    category: 'UI & Screens',
    description: 'Dashboard Jetpack Compose Screen with Course Backlog Cards & Today Overview',
    content: `package com.planner.myplanner.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.planner.myplanner.R
import com.planner.myplanner.data.database.CourseEntity
import com.planner.myplanner.ui.theme.*

@Composable
fun DashboardScreen(
    courses: List<CourseEntity>,
    onCompleteLesson: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(AmoledBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Header: Today's date and summary ring
            Card(
                colors = CardDefaults.cardColors(containerColor = AmoledCard),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = stringResource(R.string.today_overview),
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "85% Done",
                        color = AccentGold,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        item {
            Text(
                text = stringResource(R.string.courses_backlog),
                color = TextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        items(courses) { course ->
            CourseBacklogCard(
                course = course,
                onCompleteLesson = { onCompleteLesson(course.id) }
            )
        }
    }
}

@Composable
fun CourseBacklogCard(
    course: CourseEntity,
    onCompleteLesson: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = AmoledCard),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = course.name,
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "\\\${course.progressPercent}%",
                    color = AccentGold,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(10.dp))
            LinearProgressIndicator(
                progress = { course.progressPercent / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = AccentGold,
                trackColor = AmoledBorder
            )

            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = stringResource(R.string.remaining_backlog),
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "\\\${course.remainingLessons} lessons",
                        color = TextPrimary,
                        fontWeight = FontWeight.Medium
                    )
                }

                Column {
                    Text(
                        text = stringResource(R.string.net_reduction),
                        color = TextSecondary,
                        fontSize = 12.sp
                    )
                    Text(
                        text = "-\\\${course.netWeeklyBacklogReduction} / wk",
                        color = StatusSuccess,
                        fontWeight = FontWeight.Medium
                    )
                }

                Button(
                    onClick = onCompleteLesson,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentGold),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "+1 Lesson",
                        color = AmoledBackground,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
`
  },
  {
    path: 'app/src/test/java/com/planner/myplanner/BacklogCalculationTest.kt',
    category: 'Unit Tests',
    description: 'Automated Unit Tests verifying Course Backlog calculations and weekly reductions',
    content: `package com.planner.myplanner

import com.planner.myplanner.data.database.CourseEntity
import org.junit.Assert.assertEquals
import org.junit.Test

class BacklogCalculationTest {

    @Test
    fun testAiPythonCourseBacklogCalculation() {
        val aiCourse = CourseEntity(
            id = "test-ai",
            name = "AI Python",
            instructor = "Instructor",
            totalLessons = 32,
            completedLessons = 6,
            weeklyTarget = 4,
            newLessonsPerWeek = 2.0,
            courseType = "RECORDED",
            description = "Test AI"
        )

        // Initial remaining: 32 - 6 = 26
        assertEquals(26, aiCourse.remainingLessons)

        // Net weekly reduction: 4 - 2 = 2 lessons/week
        assertEquals(2.0, aiCourse.netWeeklyBacklogReduction, 0.001)

        // Estimated weeks to complete: ceil(26 / 2) = 13 weeks
        assertEquals(13, aiCourse.estimatedWeeksToComplete)
    }

    @Test
    fun testTechnoSharifMathCourseBacklogCalculation() {
        val mathCourse = CourseEntity(
            id = "test-math",
            name = "Techno Sharif Math",
            instructor = "Sharif",
            totalLessons = 12,
            completedLessons = 6,
            weeklyTarget = 1,
            newLessonsPerWeek = 0.5, // 1 lesson every 2 weeks
            courseType = "RECORDED",
            description = "Test Math"
        )

        // Initial remaining: 12 - 6 = 6
        assertEquals(6, mathCourse.remainingLessons)

        // Net weekly reduction: 1 - 0.5 = 0.5 lessons/week
        assertEquals(0.5, mathCourse.netWeeklyBacklogReduction, 0.001)

        // Estimated weeks to complete: ceil(6 / 0.5) = 12 weeks
        assertEquals(12, mathCourse.estimatedWeeksToComplete)
    }
}
`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    category: 'Localization',
    description: 'English String Resources for Android',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">My Planner</string>
    <string name="dashboard">Dashboard</string>
    <string name="schedule">Schedule</string>
    <string name="tasks">Tasks</string>
    <string name="learning">Learning</string>
    <string name="reports">Reports</string>
    <string name="settings">Settings</string>
    <string name="today_overview">Today\'s Overview</string>
    <string name="courses_backlog">Course Backlogs</string>
    <string name="remaining_backlog">Backlog Remaining</string>
    <string name="net_reduction">Net Weekly Reduction</string>
</resources>
`
  },
  {
    path: 'app/src/main/res/values-fa/strings.xml',
    category: 'Localization',
    description: 'Persian (Farsi) String Resources for Android',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">برنامه شخصی من</string>
    <string name="dashboard">داشبورد</string>
    <string name="schedule">برنامه هفتگی</string>
    <string name="tasks">وظایف</string>
    <string name="learning">یادگیری</string>
    <string name="reports">گزارش‌ها</string>
    <string name="settings">تنظیمات</string>
    <string name="today_overview">نمای کلی امروز</string>
    <string name="courses_backlog">عقب‌افتادگی دوره‌ها</string>
    <string name="remaining_backlog">باقی‌مانده عقب‌افتادگی</string>
    <string name="net_reduction">کاهش خالص هفتگی</string>
</resources>
`
  },
  {
    path: 'README.md',
    category: 'Documentation',
    description: 'Android Studio Setup, Compilation & Signed APK Release Guide',
    content: `# My Planner (برنامه شخصی من) - Native Android Project

## Overview
A production-grade native Android app built with:
- **Language**: Kotlin 1.9+
- **UI Toolkit**: Jetpack Compose with Material 3 (AMOLED Dark theme)
- **Local Persistence**: Room Database (SQLite) with Coroutines & Flow
- **Reminders**: AlarmManager for exact scheduled alarms + BootReceiver for reboot recovery
- **Localization**: Full Persian (RTL) and English (LTR) via Android string resources

## How to Build in Android Studio
1. Open Android Studio (Hedgehog 2023.1.1 or newer).
2. Select **File > Open** and choose this project root directory.
3. Allow Gradle to sync dependencies automatically.
4. Run tests: In the terminal run \`./gradlew test\` to execute \`BacklogCalculationTest\`.
5. Run on device/emulator: Click **Run 'app'** or press Shift+F10.

## Building a Release APK
To generate a release APK:
\`\`\`bash
./gradlew assembleRelease
\`\`\`
The APK will be generated at: \`app/build/outputs/apk/release/app-release-unsigned.apk\`.
Sign with your production keystore using \`apksigner\`.
`
  }
];
