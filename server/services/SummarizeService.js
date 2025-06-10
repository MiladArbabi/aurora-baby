// server/services/SummarizeService.js
const { generateText } = require('./llamaService');

async function summarizeLogs(logs, format = 'story') {
    if (!Array.isArray(logs) || logs.length === 0) {
      throw new Error('Logs must be a non-empty array');
    }
    for (const log of logs) {
      if (!log.timestamp || !log.type) {
        throw new Error('Each log must have timestamp and type');
      }
    }
  
    const bullets = logs.map((l) => {
        // Use UTC time
        const time = new Date(l.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC',
        });
        let details = '';
        if (l.type === 'feeding' && l.data) {
          details = `bottle-fed ${l.data.quantity || ''} oz`;
        } else if (l.data) {
          details = JSON.stringify(l.data);
        }
        return `- ${time}: ${l.type} (${details})`;
      });
  
      const prompt = `
      ### Task:
      Write a concise, factual summary of the baby’s activities.
      Use a neutral, professional tone, like a pediatric report.
      Use short sentences (≤10 words).
      Use "bottle" for bottle-feeding logs.
      Include only details from the logs below.
      Do not repeat the log entries verbatim.
      Output a single sentence summarizing the activity.
      
      ### Logs:
      ${bullets.join('\n')}
      
      ### Summary:
      `.trim();
  
      console.log('[SummarizeService] Generated Prompt:', prompt);
      try {
        let summary = await generateText(prompt, {
          maxTokens: 150, // Increased for flexibility
          temperature: 0.2, // Slightly higher for summarization
          stopTriggers: ['###'],
        });
        // Fallback if summary is invalid
        if (!summary || !summary.toLowerCase().includes('bottle') || summary.startsWith('-')) {
          const log = logs[0];
          if (log.type === 'feeding' && log.data.method === 'bottle') {
            const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'UTC',
            });
            summary = `Baby consumed ${log.data.quantity} oz bottle at ${time}.`;
          } else {
            const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'UTC',
            });
            summary = `Baby had ${log.type} at ${time}.`;
          }
        }
        return summary;
      } catch (err) {
        console.error('[SummarizeService] Error:', err.message);
        const log = logs[0];
        if (log.type === 'feeding' && log.data.method === 'bottle') {
          const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'UTC',
          });
          return `Baby consumed ${log.data.quantity} oz bottle at ${time}.`;
        }
        const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC',
        });
        return `Baby had ${log.type} at ${time}.`;
      }
    }
    
    module.exports = { summarizeLogs };