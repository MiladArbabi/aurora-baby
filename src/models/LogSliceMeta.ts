// src/models/LogSliceMeta.ts
import { z } from 'zod'

export const LogSliceMetaSchema = z.object({
  id: z.string(),                       // Matches LogSlice ID
  source: z.enum(['rule', 'ai', 'user']),
  confirmed: z.boolean().default(false),
  edited: z.boolean().default(false),
  createdBy: z.string().optional(),     // optional userID (future multi-user mode)
  lastModified: z.string(),            // ISO timestamp
})

export type LogSliceMeta = z.infer<typeof LogSliceMetaSchema>
