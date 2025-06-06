// src/storage/ScheduleStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { LogSlice } from '../models/LogSlice'

const makeKey = (babyId: string, dateISO: string) =>
  `schedule:${babyId}:${dateISO}`

export const saveDailySchedule = async (
  dateISO: string,
  babyId: string,
  slices: LogSlice[]
): Promise<void> => {
  const key = makeKey(babyId, dateISO)
  const json = JSON.stringify(slices)
  await AsyncStorage.setItem(key, json)
}

export const getDailySchedule = async (
  dateISO: string,
  babyId: string
): Promise<LogSlice[] | null> => {
  const key = makeKey(babyId, dateISO)
  const raw = await AsyncStorage.getItem(key)
  return raw ? (JSON.parse(raw) as LogSlice[]) : null
}

export const saveDailyScheduleIfMissing = async (
  dateISO: string,
  babyId: string,
  slices: LogSlice[]
): Promise<void> => {
  const existing = await getDailySchedule(dateISO, babyId)
  if (!existing) {
    await saveDailySchedule(dateISO, babyId, slices)
  }
}
export const deleteDailySchedule = async (
  dateISO: string,
  babyId: string
): Promise<void> => {
  const key = makeKey(babyId, dateISO)
  await AsyncStorage.removeItem(key)
}
export const hasDailySchedule = async (
  dateISO: string,
  babyId: string
): Promise<boolean> => {
  const key = makeKey(babyId, dateISO)
  const exists = await AsyncStorage.getItem(key)
  return exists !== null
}
export const clearAllSchedules = async (babyId: string): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys()
  const scheduleKeys = keys.filter(key => key.startsWith(`schedule:${babyId}:`))
  await AsyncStorage.multiRemove(scheduleKeys)
}
export const getAllSchedulesForBaby = async (
  babyId: string
): Promise<Record<string, LogSlice[]>> => { 
  const keys = await AsyncStorage.getAllKeys()
  const scheduleKeys = keys.filter(key => key.startsWith(`schedule:${babyId}:`))
  
  const schedules: Record<string, LogSlice[]> = {}
  for (const key of scheduleKeys) {
    const dateISO = key.split(':')[2] // Extract date from key
    const raw = await AsyncStorage.getItem(key)
    if (raw) {
      schedules[dateISO] = JSON.parse(raw) as LogSlice[]
    }
  }
  
  return schedules
}
export const getAllSchedulesForDateRange = async (
  babyId: string,
  startDateISO: string,
  endDateISO: string
): Promise<Record<string, LogSlice[]>> => {         
    const start = new Date(startDateISO)
    const end = new Date(endDateISO)
    const schedules: Record<string, LogSlice[]> = {}
    
    while (start <= end) {
        const dateISO = start.toISOString().split('T')[0]
        const slices = await getDailySchedule(dateISO, babyId)
        if (slices) {
        schedules[dateISO] = slices
        }
        start.setDate(start.getDate() + 1)
    }
    
    return schedules
    }
export const getAllSchedules = async (): Promise<Record<string, Record<string, LogSlice[]>>> => {   
    const keys = await AsyncStorage.getAllKeys()
    const scheduleKeys = keys.filter(key => key.startsWith('schedule:'))
    
    const schedules: Record<string, Record<string, LogSlice[]>> = {}
    
    for (const key of scheduleKeys) {
        const [_, babyId, dateISO] = key.split(':')
        if (!schedules[babyId]) {
        schedules[babyId] = {}
        }
        
        const raw = await AsyncStorage.getItem(key)
        if (raw) {
        schedules[babyId][dateISO] = JSON.parse(raw) as LogSlice[]
        }
    }
    
    return schedules
    }

export const getAllSchedulesForBabyInRange = async (
    babyId: string, 
    startDateISO: string,
    endDateISO: string,
): Promise<Record<string, LogSlice[]>> => {
    const allSchedules = await getAllSchedulesForBaby(babyId)
    const schedulesInRange: Record<string, LogSlice[]> = {}

    for (const dateISO in allSchedules) {
        if (dateISO >= startDateISO && dateISO <= endDateISO) {
            schedulesInRange[dateISO] = allSchedules[dateISO]
        }
    }

    return schedulesInRange
}
export const getAllSchedulesForBabyInLastNDays = async (
    babyId: string,
    days: number
): Promise<Record<string, LogSlice[]>> => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - days)

    const startISO = startDate.toISOString().split('T')[0]
    const endISO = today.toISOString().split('T')[0]

    return getAllSchedulesForBabyInRange(babyId, startISO, endISO)
}
export const getAllSchedulesForBabyInLastNWeeks = async (
    babyId: string,
    weeks: number   
): Promise<Record<string, LogSlice[]>> => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - weeks * 7)

    const startISO = startDate.toISOString().split('T')[0]
    const endISO = today.toISOString().split('T')[0]

    return getAllSchedulesForBabyInRange(babyId, startISO, endISO)
}
export const getAllSchedulesForBabyInLastNMonths = async (
    babyId: string,
    months: number
): Promise<Record<string, LogSlice[]>> => {             
    const today = new Date()
    const startDate = new Date(today)
    startDate.setMonth(today.getMonth() - months)

    const startISO = startDate.toISOString().split('T')[0]
    const endISO = today.toISOString().split('T')[0]

    return getAllSchedulesForBabyInRange(babyId, startISO, endISO)
}
