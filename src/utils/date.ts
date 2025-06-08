// src/utils/date.ts

/**
 * Returns today's date in 'YYYY-MM-DD' format, based on local time.
 */
export function getTodayISO(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  /**
   * Returns an object with year, month, and day strings, zero-padded.
   */
  export function getTodayParts(): { year: string; month: string; day: string } {
    const today = new Date()
    return {
      year: String(today.getFullYear()),
      month: String(today.getMonth() + 1).padStart(2, '0'),
      day: String(today.getDate()).padStart(2, '0'),
    }
  }
  