// src/services/DailyScheduleEngine.ts
import type { LogSlice } from '../models/LogSlice'
import { DefaultScheduleGenerator } from './DefaultScheduleGenerator'
import { getTemplate, ensureDefaultTemplateExists } from './TemplateService'
import { DEFAULT_TEMPLATE } from '../config/defaultScheduleTemplates'

const DEFAULT_TEMPLATE_ID = DEFAULT_TEMPLATE.templateId!
/**
 * Generates the day’s schedule by loading the baby’s template
 * (falling back to the default if missing) and then running
 * DefaultScheduleGenerator over it.
 */

export class DailyScheduleEngine {
  static async generateScheduleForDate({
    babyId,
    date,
  }: {
    babyId: string
    date: string // ISO string like "2025-06-05"
  }): Promise<LogSlice[]> {
    console.log('[DailyScheduleEngine] generating for', babyId, date)
    // 1) Load the template (or bootstrap the default)
    let template
    try {
      template = await getTemplate(babyId, DEFAULT_TEMPLATE_ID)
    } catch {
      console.warn('[DailyScheduleEngine] template missing, bootstrapping & retrying')
      await ensureDefaultTemplateExists(babyId)
      template = await getTemplate(babyId, DEFAULT_TEMPLATE_ID)
    }
    console.log('[DailyScheduleEngine] using template.entries=', template.entries)
    const slices = DefaultScheduleGenerator.generateFromTemplate({ babyId, dateISO: date, template })
    console.log('[DailyScheduleEngine] generated slices=', slices)
    return slices
  }
}