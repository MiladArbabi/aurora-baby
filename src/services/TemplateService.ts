// src/services/TemplateService.ts
import { ScheduleTemplate, ScheduleTemplateSchema } from '../models/ScheduleTemplate'
import * as TemplateStorage from '../storage/TemplateStorage'
import { DEFAULT_TEMPLATE } from '../config/defaultScheduleTemplates'

/**
 * Ensures that the “standard” template exists (runs once on app start).
 */
export async function bootstrapTemplates(babyId: string) {
  const existing = await TemplateStorage.getTemplate(babyId, DEFAULT_TEMPLATE.templateId!)
  if (!existing) {
    // Validate
    ScheduleTemplateSchema.parse(DEFAULT_TEMPLATE)
    await TemplateStorage.saveTemplate(babyId, DEFAULT_TEMPLATE)
  }
}

export async function listTemplates(babyId: string): Promise<ScheduleTemplate[]> {
  return TemplateStorage.listTemplates(babyId)
}

export async function getTemplate(
  babyId: string,
  templateId: string
): Promise<ScheduleTemplate> {
  const t = await TemplateStorage.getTemplate(babyId, templateId)
  if (!t) throw new Error(`Template ${templateId} not found`)
  return t
}

export async function createOrUpdateTemplate(
  babyId: string,
  template: ScheduleTemplate
): Promise<void> {
  // Validate shape & coverage
  ScheduleTemplateSchema.parse(template)
  await TemplateStorage.saveTemplate(babyId, template)
}

export async function deleteTemplate(babyId: string, templateId: string): Promise<void> {
  await TemplateStorage.deleteTemplate(babyId, templateId)
}

export async function clearAllTemplates(babyId: string): Promise<void> {
  await TemplateStorage.clearAllTemplates(babyId)
}

export async function ensureDefaultTemplateExists(babyId: string): Promise<void> {
  const existing = await TemplateStorage.getTemplate(babyId, DEFAULT_TEMPLATE.templateId!)
  if (!existing) {
    // Validate the default template
    ScheduleTemplateSchema.parse(DEFAULT_TEMPLATE)
    await TemplateStorage.saveTemplate(babyId, DEFAULT_TEMPLATE)
  }
}
// This function ensures that the default template is available for a baby.

