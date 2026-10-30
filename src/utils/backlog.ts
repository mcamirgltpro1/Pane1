import { Course } from '../types';

export interface BacklogAnalysis {
  remainingLessons: number;
  progressPercent: number;
  netWeeklyReduction: number;
  estimatedWeeksToComplete: number;
  statusText: string;
}

export function calculateBacklog(course: Course): BacklogAnalysis {
  const remaining = Math.max(0, course.totalLessons - course.completedLessons);
  const progressPercent = course.totalLessons > 0 
    ? Math.round((course.completedLessons / course.totalLessons) * 100) 
    : 0;

  // Net weekly reduction = target per week - new lessons released per week
  const netWeeklyReduction = course.weeklyTarget - course.newLessonsPerWeek;

  let estimatedWeeks = 0;
  let statusText = 'On track';

  if (remaining === 0) {
    statusText = 'Completed';
  } else if (netWeeklyReduction <= 0) {
    statusText = 'Backlog growing';
    estimatedWeeks = Infinity;
  } else {
    estimatedWeeks = Math.ceil(remaining / netWeeklyReduction);
    statusText = `~${estimatedWeeks} weeks`;
  }

  return {
    remainingLessons: remaining,
    progressPercent,
    netWeeklyReduction: Number(netWeeklyReduction.toFixed(1)),
    estimatedWeeksToComplete: estimatedWeeks === Infinity ? 999 : estimatedWeeks,
    statusText,
  };
}

export function formatWeeksEstimate(weeks: number, lang: 'fa' | 'en'): string {
  if (weeks === 0) return lang === 'fa' ? 'تکمیل شده' : 'Completed';
  if (weeks >= 999) return lang === 'fa' ? 'نامحدود (عقب‌افتادگی افزایشی)' : 'Infinite (accumulating)';
  return lang === 'fa' ? `تقریباً ${weeks} هفته` : `Approx. ${weeks} weeks`;
}
