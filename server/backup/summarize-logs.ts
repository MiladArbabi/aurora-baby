// api/summarize-logs.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Joi from 'joi'
import { summarizeLogs } from '../server/services/llamaService'

const logSchema = Joi.object({
  timestamp: Joi.date().iso().required(),
  event:     Joi.string().valid('feeding', 'sleeping', 'playing', 'diaper').required(),
  details:   Joi.object().optional(),
})

const summarizeSchema = Joi.object({
  logs:   Joi.array().items(logSchema).min(1).max(100).required(),
  format: Joi.string().valid('story', 'narration').default('story'),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Joi validates req.body directly
  const { error, value } = summarizeSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }

  try {
    // `value.logs` is typed, `format` has default
    const summary = await summarizeLogs(value.logs, { format: value.format })
    return res.status(200).json({ summary, format: value.format })
  } catch (err: any) {
    console.error('[SummarizeLogsRoute] summarizeLogs error', err)
    return res.status(500).json({ error: 'Failed to summarize logs' })
  }
}
