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
        const time = new Date(l.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'UTC',
        });
        let details = '';
        if (l.type === 'feeding' && l.data) {
          const unit = l.data.unit || 'oz';
          const subtype = l.data.subtype ? ` ${l.data.subtype}` : '';
          details = `bottle-fed${subtype} ${l.data.quantity || 'unknown'} ${unit}`;
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
        For bottle-feeding, include quantity and unit (e.g., "5 oz").
        Use "consumed" for bottle-feeding logs.
        Include subtype (e.g., "formula") if provided.
        Include only details from the logs below.
        Do not repeat the log entries verbatim.
        Output a single sentence: "Baby consumed [quantity] [unit] [subtype] bottle at [time]."

        ### Logs:
        ${bullets.join('\n')}

        ### Summary:
        `.trim();

        console.log('[SummarizeService] Generated Prompt:', prompt);
        try {
          let summary = await generateText(prompt, {
            maxTokens: 150,
            temperature: 0.4,
            stopTriggers: ['###'],
          });
          const log = logs[0];
          const expectedUnit = log.data?.unit || 'oz';
          const expectedQuantity = log.data?.quantity || 'unknown';
          const expectedSubtype = log.data?.subtype || '';
          if (
            !summary ||
            !summary.toLowerCase().includes('bottle') ||
            !summary.toLowerCase().includes(expectedUnit.toLowerCase()) ||
            summary.startsWith('-') ||
            (expectedQuantity === 'unknown' && summary.match(/\d+/)?.length) ||
            (expectedSubtype && !summary.toLowerCase().includes(expectedSubtype.toLowerCase()))
          ) {
            if (log.type === 'feeding' && log.data.method === 'bottle') {
              const time = new Date(log.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC',
              });
              const subtype = expectedSubtype ? `${expectedSubtype} ` : '';
              summary = `Baby consumed ${expectedQuantity} ${expectedUnit} ${subtype}bottle at ${time}.`;
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
            const unit = log.data.unit || 'oz';
            const quantity = log.data.quantity || 'unknown';
            const subtype = log.data.subtype ? `${log.data.subtype} ` : '';
            return `Baby consumed ${quantity} ${unit} ${subtype}bottle at ${time}.`;
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