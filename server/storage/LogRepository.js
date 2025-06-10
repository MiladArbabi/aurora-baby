const fs = require('fs').promises;
const path = require('path');

const LOGS_FILE = path.resolve(__dirname, '../data/logs.json');

// Ensure data directory and file exist
async function ensureDataFile() {
  const dir = path.dirname(LOGS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    if (!(await fs.access(LOGS_FILE).then(() => true).catch(() => false))) {
      await fs.writeFile(LOGS_FILE, JSON.stringify([]));
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
    return JSON.parse(data) || [];
  } catch (err) {
    console.error('[LogRepository] getAllEntries error:', err);
    return [];
  }
}

module.exports = {
  getAllEntries,
};