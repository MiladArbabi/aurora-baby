// src/models/ScheduleTemplate.ts
import { z } from 'zod'

// One block in the default daily schedule
export const ScheduleTemplateEntrySchema = z.object({
  category: z.enum([
    'sleep',
    'awake',
    'feed',
    'diaper',
    'care',
    'talk',
    'other',
  ]),
  // Start time in hours (0–24), inclusive
  startHour: z.number().min(0).max(24),
  // End time in hours (0–24), exclusive
  endHour: z.number().min(0).max(24),
}).refine(
  entry => entry.endHour > entry.startHour,
  { message: 'endHour must be greater than startHour' }
)

// Overall template: named collection of entries that cover exactly 24h
export const ScheduleTemplateSchema = z.object({
  // Optional identifier (e.g. baby profile key)
  templateId: z.string().optional(),
  entries: z.array(ScheduleTemplateEntrySchema),
}).superRefine((data, ctx) => {
  const total = data.entries.reduce(
    (sum, { startHour, endHour }) => sum + (endHour - startHour),
    0
  )
  if (total !== 24) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Entries must cover exactly 24 hours (got ${total})`,
    })
  }
})

export type ScheduleTemplateEntry = z.infer<typeof ScheduleTemplateEntrySchema>
export type ScheduleTemplate = z.infer<typeof ScheduleTemplateSchema>
