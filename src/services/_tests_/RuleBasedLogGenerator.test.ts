import { generateRuleBasedQuickLogs } from '../RuleBasedLogGenerator';
import { QuickLogEntry } from '../../models/LogSchema';

describe('generateRuleBasedQuickLogs', () => {
  it('should return at least one feeding or diaper log for hoursAhead=24 when recentLogs is empty', async () => {
    const babyId = 'test-baby-id';
    const future = await generateRuleBasedQuickLogs([], 24, babyId);
    // Expect at least one entry with type 'feeding' or 'diaper'
    expect(future.length).toBeGreaterThan(0);
    const types = future.map((e: QuickLogEntry) => e.type);
    expect(types).toEqual(expect.arrayContaining(['feeding', 'diaper']));
  });
  // You can add more tests: when recentLogs includes a feeding at time T,
  // confirm that the first generated feeding log is at least T + feedingGapMinutes.
});
