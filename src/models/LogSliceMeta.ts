// src/models/LogMetadata.ts
import { z } from 'zod'

/**
 * Rich metadata for each LogSlice, enabling
 *  - source attribution (rule/ai/user/system)
 *  - confirmation & edit tracking
 *  - optional mood tagging and freeform notes
 *  - arbitrary tags (for AI or user labels)
 *  - conflict/incompleteness flags
 */
export const LogSliceMetaSchema = z.object({
  id: z.string(),                    // Matches LogSlice.id
  source: z.enum(['rule', 'ai', 'user', 'system']),
  confirmed: z.boolean().default(false),
  edited: z.boolean().default(false),
  createdBy: z.string().optional(), // userID in multi-user scenarios
  lastModified: z.string(),         // ISO timestamp

  // new rich fields:
  mood: z.enum(['happy','neutral','fussy','sleepy','hungry']).optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),

  // quality flags:
  overlap: z.boolean().default(false),
  incomplete: z.boolean().default(false),
})

export type LogSliceMeta = z.infer<typeof LogSliceMetaSchema>

/**
 * Example: loading, validating, and saving metadata
 */
export async function normalizeMetadata(raw: unknown): Promise<LogSliceMeta> {
  // This will throw if invalid
  return LogSliceMetaSchema.parse(raw)
}
