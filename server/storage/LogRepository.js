// server/storage/LogRepository.js
const fs = require('fs').promises;
const path = require('path');

const LOGS_FILE = path.resolve(__dirname, '../data/logs.json');

// Seed data
const initialLogs = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    babyId: '456e7890-e89b-12d3-a456-426614174001',
    timestamp: '2025-11-10T09:00:00Z',
    type: 'feeding',
    version: 1,
    data: { method: 'bottle', quantity: 4 }
  }
];

// Ensure data directory and file exist
async function ensureDataFile() {
  const dir = path.dirname(LOGS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log('[LogRepository] Data directory ensured:', dir);
    // Check file size instead of existence to detect empty files
    let shouldSeed = false;
    try {
      const stats = await fs.stat(LOGS_FILE);
      if (stats.size === 0 || JSON.parse(await fs.readFile(LOGS_FILE, 'utf8')).length === 0) {
        shouldSeed = true;
      }
    } catch {
      shouldSeed = true; // File doesn’t exist
    }
    if (shouldSeed) {
      console.log('[LogRepository] Seeding logs.json with initial data');
      await fs.writeFile(LOGS_FILE, JSON.stringify(initialLogs, null, 2));
      console.log('[LogRepository] Seeding complete');
    }
  } catch (err) {
    console.error('[LogRepository] Failed to initialize:', err);
  }
}

// Fetch all log entries
async function getAllEntries() {
  await ensureDataFile();
  try {
    const data = await fs.readFile(LOGS_FILE, 'utf8');
    const logs = JSON.parse(data) || [];
    console.log('[LogRepository] Fetched logs:', logs.length);
    return logs;
  } catch (err) {
    console.error('[LogRepository] getAllEntries error:', err);
    return [];
  }
}

// Save a new log entry
async function saveEntry(entry) {
  await ensureDataFile();
  try {
    const logs = await getAllEntries();
    logs.push(entry);
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
    console.log('[LogRepository] Saved entry:', entry.id);
  } catch (err) {
    console.error('[LogRepository] saveEntry error:', err);
    throw err;
  }
}

module.exports = {
  getAllEntries,
  saveEntry,
};