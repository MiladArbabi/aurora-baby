// src/services/RuleBasedLogGenerator.ts

// Import needed types and utilities
import { QuickLogEntry, FeedingLog, DiaperLog } from '../models/LogSchema';  
import { getGapSettings } from './GapSettingsStorage';                               
import { getBabyProfile } from 'storage/BabyProfileStorage';                           
import { v4 as uuidv4 } from 'uuid';                                                 

// A helper to get “now” and “end” timestamps
const nowUtc = () => new Date();                                                    

/**
 * Generate future “feeding” and “diaper” QuickLogEntries based purely on gap settings.
 *
 * @param recentLogs   Array of QuickLogEntry for the past (to find the last‐logged time)
 * @param hoursAhead   How many hours into the future to plan (e.g. 24 or 168)
 * @param babyId       The ID of the child (required so each QuickLogEntry.babyId is set)
 */
export async function generateRuleBasedQuickLogs(
  recentLogs: QuickLogEntry[],
  hoursAhead: number,
  babyId: string
): Promise<QuickLogEntry[]> {
  // 1) Fetch the child’s gap settings (feedingGapMinutes, diaperGapHours, etc.)
  let gapSettings;
  try {
    gapSettings = await getGapSettings(babyId);                                    
  } catch {
    // If something fails, fallback to a minimal default
    gapSettings = { feedingGapMinutes: 180, diaperGapHours: 6, sleepGapHours: 6 };  
  }

  //  2) Compute the window boundaries
  const startTime = nowUtc();                                                        
  const endTime = new Date(startTime.getTime() + hoursAhead * 60 * 60 * 1000);       

  // 3) Find the last “feeding” and last “diaper” timestamps in recentLogs
  let lastFeedingTime: Date = startTime;  // if no prior feeding, assume “now” as baseline
  let lastDiaperTime: Date = startTime;

  recentLogs.forEach((entry) => {                                                    
    const ts = new Date(entry.timestamp);
    if (entry.type === 'feeding' && ts > lastFeedingTime) {
      lastFeedingTime = ts;                                                           
    }
    if (entry.type === 'diaper' && ts > lastDiaperTime) {
      lastDiaperTime = ts;                                                            
    }
  });

  // 4) Build future entries list
  const futureEntries: QuickLogEntry[] = [];

  // 5)  - FEEDING logs
  {
    // a) First possible feeding time is lastFeedingTime + feedingGapMinutes
    let nextFeed = new Date(
      lastFeedingTime.getTime() + gapSettings.feedingGapMinutes * 60 * 1000
    );                                                                                

    // b) Loop until we exceed endTime
    while (nextFeed <= endTime) {
      const feedingLog: FeedingLog = {                                                
        id: uuidv4(),
        babyId,
        timestamp: nextFeed.toISOString(),
        type: 'feeding',
        version: 1,
        data: {
          method: 'bottle',        // default to 'bottle'; you can adjust later
          quantity: undefined,
          notes: undefined,
        },
      };
      futureEntries.push(feedingLog);                                                 

      // c) Advance nextFeed by feedingGapMinutes again
      nextFeed = new Date(
        nextFeed.getTime() + gapSettings.feedingGapMinutes * 60 * 1000
      );                                                                              
    }
  }

  // 6) DIAPER logs
  {
    // a) First possible diaper time is lastDiaperTime + diaperGapHours
    let nextDiaper = new Date(
      lastDiaperTime.getTime() + gapSettings.diaperGapHours * 60 * 60 * 1000
    );                                                                                

    // b) Loop until we exceed endTime
    while (nextDiaper <= endTime) {
      const diaperLog: DiaperLog = {                                                  
        id: uuidv4(),
        babyId,
        timestamp: nextDiaper.toISOString(),
        type: 'diaper',
        version: 1,
        data: {
          status: 'wet',          // default to 'wet'; adjust as needed
          notes: undefined,
        },
      };
      futureEntries.push(diaperLog);                                                  

      // c) Advance nextDiaper by diaperGapHours again
      nextDiaper = new Date(
        nextDiaper.getTime() + gapSettings.diaperGapHours * 60 * 60 * 1000
      );                                                                              
    }
  }

  // 7)  (Optional) You could similarly generate “sleep” reminders here,
  // but for now we focus on feeding & diaper. Return what we’ve built.
  return futureEntries;                                                            
}                                                                                    