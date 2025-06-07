// src/storage/TemplateStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ScheduleTemplate } from '../models/ScheduleTemplate'

const makeKey = (babyId: string, templateId: string) =>
  `template:${babyId}:${templateId}`

export async function listTemplates(babyId: string): Promise<ScheduleTemplate[]> {
  const allKeys = await AsyncStorage.getAllKeys()
  const prefix  = `template:${babyId}:`
  const keys    = allKeys.filter(k => k.startsWith(prefix))
  const out: ScheduleTemplate[] = []
  for (const key of keys) {
    const raw = await AsyncStorage.getItem(key)
    if (raw) out.push(JSON.parse(raw))
  }
  return out
}

export async function getTemplate(
  babyId: string,
  templateId: string
): Promise<ScheduleTemplate | null> {
  const key = makeKey(babyId, templateId)
  const raw = await AsyncStorage.getItem(key)
  return raw ? JSON.parse(raw) : null
}

export async function saveTemplate(
  babyId: string,
  template: ScheduleTemplate
): Promise<void> {
  const key = makeKey(babyId, template.templateId || 'default')
  await AsyncStorage.setItem(key, JSON.stringify(template))
}

export async function deleteTemplate(
  babyId: string,
  templateId: string
): Promise<void> {
  const key = makeKey(babyId, templateId)
  await AsyncStorage.removeItem(key)
}

export async function clearAllTemplates(babyId: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys()
  const templateKeys = keys.filter(key => key.startsWith(`template:${babyId}:`))
  await AsyncStorage.multiRemove(templateKeys)
}
