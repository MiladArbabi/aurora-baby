// src/config/defaultScheduleTemplates.ts

import type { ScheduleTemplate } from '../models/ScheduleTemplate'

export const DEFAULT_TEMPLATE: ScheduleTemplate = {
  templateId: 'standard',
  entries: [
    { category: 'sleep', startHour: 0, endHour: 6 },
    { category: 'awake', startHour: 6, endHour: 8 },
    { category: 'feed',  startHour: 8, endHour: 8.5 },
    { category: 'care',  startHour: 8.5, endHour: 12 },
    { category: 'sleep', startHour: 12, endHour: 14 },
    { category: 'awake', startHour: 14, endHour: 18 },
    { category: 'feed',  startHour: 18, endHour: 18.5 },
    { category: 'care',  startHour: 18.5, endHour: 22 },
    { category: 'sleep', startHour: 22, endHour: 24 },
  ],
}
