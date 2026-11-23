/**
 * Indian Public Holidays & Working Days Calculation Engine
 * Rule: 20 to 25 Working Days payout window
 * Excludes: Saturdays, Sundays, and Major Indian Public/Bank Holidays
 */

// Major Indian Public Holidays (Fixed & Dynamic Month-Day)
export const INDIAN_HOLIDAYS_2026: string[] = [
  "2026-01-26", // Republic Day
  "2026-03-04", // Holi
  "2026-03-20", // Eid-ul-Fitr
  "2026-04-03", // Good Friday
  "2026-04-14", // Dr. Ambedkar Jayanti
  "2026-05-01", // Maharashtra / May Day
  "2026-05-27", // Bakrid / Eid-ul-Adha
  "2026-08-15", // Independence Day
  "2026-08-27", // Raksha Bandhan
  "2026-09-04", // Janmashtami
  "2026-10-02", // Gandhi Jayanti
  "2026-10-20", // Dussehra
  "2026-11-08", // Diwali (Lakshmi Puja)
  "2026-11-09", // Govardhan Puja
  "2026-11-10", // Bhai Dooj
  "2026-11-24", // Guru Nanak Jayanti
  "2026-12-25", // Christmas Day
];

/**
 * Checks if a given date is a business working day (Not Saturday, Not Sunday, Not Holiday)
 */
export function isWorkingDay(date: Date, holidays: string[] = INDIAN_HOLIDAYS_2026): boolean {
  const dayOfWeek = date.getDay();
  // 0 = Sunday, 6 = Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const formatted = `${yyyy}-${mm}-${dd}`;

  return !holidays.includes(formatted);
}

/**
 * Adds N working days to a start date
 */
export function addWorkingDays(startDate: Date, daysToAdd: number, holidays: string[] = INDIAN_HOLIDAYS_2026): Date {
  let current = new Date(startDate.getTime());
  let added = 0;

  while (added < daysToAdd) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current, holidays)) {
      added++;
    }
  }

  return current;
}

/**
 * Calculates remaining working days between today and a target date
 */
export function getRemainingWorkingDays(targetDate: Date, fromDate: Date = new Date(), holidays: string[] = INDIAN_HOLIDAYS_2026): number {
  let current = new Date(fromDate.getTime());
  let count = 0;

  // Set time to start of day for clean comparison
  current.setHours(0, 0, 0, 0);
  const target = new Date(targetDate.getTime());
  target.setHours(0, 0, 0, 0);

  if (current >= target) return 0;

  while (current < target) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current, holidays)) {
      count++;
    }
  }

  return count;
}
