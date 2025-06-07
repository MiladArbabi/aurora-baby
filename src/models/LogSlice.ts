// src/models/LogSlice.ts
import { z } from 'zod'

export const LogSliceSchema = z.object({
  id: z.string(),                  // UUID
  babyId:    z.string(),
  category: z.enum(['sleep', 'awake', 'diaper', 'feed', 'care', 'talk', 'other']),
  startTime: z.string(),          // ISO timestamp
  endTime: z.string(),            // ISO timestamp
  createdAt: z.string(),          // ISO timestamp
  updatedAt: z.string(),          // ISO timestamp
  version: z.number().optional().default(1),
})

export type LogSlice = z.infer<typeof LogSliceSchema>
