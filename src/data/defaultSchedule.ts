// src/data/defaultSchedule.ts
import type { ScheduleTemplateEntry } from "../models/ScheduleTemplate";

export const DefaultDailyEntries: ScheduleTemplateEntry[] = [
  // ⚫ Night sleep
  { category: 'sleep', startHour: 20, endHour: 6 },
  // ⚫ Morning wake / feed / diaper
  { category: 'awake', startHour: 6, endHour: 6.5 },
  { category: 'feed',  startHour: 6.5, endHour: 7 },
  { category: 'diaper',startHour: 7,   endHour: 7.1 },
  { category: 'care',  startHour: 7.1, endHour: 7.4 },
  { category: 'talk',  startHour: 7.4, endHour: 8 },
  // ⚫ Mid‐morning nap
  { category: 'sleep', startHour: 8, endHour: 9.5 },
  // ⚫ Late‐morning feed + diaper
  { category: 'feed',   startHour: 9.5, endHour: 10 },
  { category: 'diaper', startHour: 10,  endHour: 10.1 },
  // ⚫ Lunch / care / talk
  { category: 'feed', startHour: 10.1, endHour: 10.6 },
  { category: 'care', startHour: 10.6, endHour: 11 },
  { category: 'talk', startHour: 11,   endHour: 12 },
  // ⚫ Afternoon nap
  { category: 'sleep', startHour: 12,   endHour: 14 },
  // ⚫ Mid‐afternoon feed + diaper
  { category: 'feed',   startHour: 14,  endHour: 14.5 },
  { category: 'diaper', startHour: 14.5,endHour: 14.6 },
  // ⚫ Late afternoon play/care/talk
  { category: 'care', startHour: 14.6, endHour: 16 },
  { category: 'talk', startHour: 16,   endHour: 17 },
  // ⚫ Early evening feed + diaper
  { category: 'feed',   startHour: 17, endHour: 17.5 },
  { category: 'diaper', startHour: 17.5,endHour: 17.6 },
  // ⚫ Wind-down / other
  { category: 'care', startHour: 17.6, endHour: 19 },
  { category: 'other',startHour: 19,   endHour: 20 },
]
