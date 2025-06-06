import { z } from 'zod'

export const LogSliceSchema = z.object({
  id: z.string(),                  // UUID
  category: z.enum(['sleep', 'awake', 'diaper', 'feed', 'care', 'talk', 'other']),
  startTime: z.string(),          // ISO timestamp
  endTime: z.string(),            // ISO timestamp
  createdAt: z.string(),          // ISO timestamp
  updatedAt: z.string(),          // ISO timestamp
})

export type LogSlice = z.infer<typeof LogSliceSchema>
