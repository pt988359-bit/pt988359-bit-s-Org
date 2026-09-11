/**
 * Enterprise Architecture - Centralized Date & Time Service
 * Phase 14.5 Refactoring
 *
 * Eliminates ad-hoc `new Date()` calls throughout application logic.
 */

export class DateTimeService {
  /**
   * Returns current ISO 8601 string
   */
  public static nowISO(): string {
    return new Date().toISOString();
  }

  /**
   * Returns current date formatted as YYYY-MM-DD
   */
  public static todayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Formats ISO or date string to readable Arabic date string (e.g., 28 يوليو 2026)
   */
  public static formatArabicDate(dateInput: string | Date): string {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  }

  /**
   * Formats ISO string to readable Arabic time string (e.g., 02:30 م)
   */
  public static formatArabicTime(dateInput: string | Date): string {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  }

  /**
   * Formats ISO string to complete Arabic date and time
   */
  public static formatArabicDateTime(dateInput: string | Date): string {
    const datePart = this.formatArabicDate(dateInput);
    const timePart = this.formatArabicTime(dateInput);
    return `${datePart} - ${timePart}`;
  }

  /**
   * Returns relative time description in Arabic (e.g., منذ 5 دقائق, منذ 2 ساعة, منذ 3 أيام)
   */
  public static getRelativeTimeArabic(dateInput: string | Date): string {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays === 1) return 'أمس';
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    
    return this.formatArabicDate(d);
  }

  /**
   * Checks if date is today
   */
  public static isToday(dateInput: string | Date): boolean {
    const dStr = typeof dateInput === 'string' ? dateInput.split('T')[0] : dateInput.toISOString().split('T')[0];
    return dStr === this.todayDateString();
  }

  /**
   * Adds specified hours to a given date or current time
   */
  public static addHours(hours: number, baseDate?: Date): Date {
    const base = baseDate ? new Date(baseDate) : new Date();
    base.setHours(base.getHours() + hours);
    return base;
  }
}
