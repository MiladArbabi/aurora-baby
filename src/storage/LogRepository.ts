// src/storage/LogRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { z } from 'zod'
import { LogEntry, LogEntrySchema } from '../models/LogSchema'
import { logEmitter } from './LogEvents'

// Storage keys
const STORAGE_ALL = '@log:all'
const STORAGE_FUTURE = '@log:future'
const STORAGE_OFFLINE = '@log:offline'

// Validate an array of LogEntry
const EntriesArraySchema = z.array(LogEntrySchema)

export class LogRepository {
  /** Save a new entry */
  static async saveEntry(entry: LogEntry): Promise<void> {
    // Validate
    LogEntrySchema.parse(entry)
    const all = await this.getAllEntries()
    all.push(entry)
    await AsyncStorage.setItem(STORAGE_ALL, JSON.stringify(all))
    logEmitter.emit('saved', entry)
  }

  /** Remove an entry by id */
  static async removeEntry(id: string): Promise<void> {
    const all = await this.getAllEntries()
    const filtered = all.filter(e => e.id !== id)
    await AsyncStorage.setItem(STORAGE_ALL, JSON.stringify(filtered))
    logEmitter.emit('deleted', id)
  }

  /** Fetch all saved entries */
  static async getAllEntries(): Promise<LogEntry[]> {
    const raw = await AsyncStorage.getItem(STORAGE_ALL)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return EntriesArraySchema.parse(parsed)
  }

  /** Enqueue one entry offline */
  static async queueOffline(entry: LogEntry): Promise<void> {
    const queue = await this.getOfflineQueue()
    queue.push(entry)
    await AsyncStorage.setItem(STORAGE_OFFLINE, JSON.stringify(queue))
  }

  /** Get offline queue */
  static async getOfflineQueue(): Promise<LogEntry[]> {
    const raw = await AsyncStorage.getItem(STORAGE_OFFLINE)
    return raw ? (JSON.parse(raw) as LogEntry[]) : []
  }

  /** Clear offline queue */
  static async clearOfflineQueue(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_OFFLINE)
  }

  /** Replay and clear offline queue */
  static async syncOffline(sendFunc: (entry: LogEntry) => Promise<any>): Promise<void> {
    const queue = await this.getOfflineQueue()
    for (const entry of queue) {
      await sendFunc(entry)
    }
    await this.clearOfflineQueue()
  }

  /** Save AI‐generated future entry */
  static async saveFutureEntry(entry: LogEntry): Promise<void> {
    const future = await this.getFutureEntries()
    future.unshift(entry)
    await AsyncStorage.setItem(STORAGE_FUTURE, JSON.stringify(future))
    logEmitter.emit('future-saved', entry)
  }

  /** Delete one future entry */
  static async deleteFutureEntry(id: string): Promise<void> {
    const future = await this.getFutureEntries()
    const filtered = future.filter(e => e.id !== id)
    await AsyncStorage.setItem(STORAGE_FUTURE, JSON.stringify(filtered))
    logEmitter.emit('future-deleted', id)
  }

  /** Fetch future entries */
  static async getFutureEntries(): Promise<LogEntry[]> {
    const raw = await AsyncStorage.getItem(STORAGE_FUTURE)
    return raw ? (JSON.parse(raw) as LogEntry[]) : []
  }

  /** Get entries between timestamps */
  static async getEntriesBetween(start: string, end: string): Promise<LogEntry[]> {
    const all = await this.getAllEntries()
    return all.filter(e => e.timestamp >= start && e.timestamp <= end)
  }
}
