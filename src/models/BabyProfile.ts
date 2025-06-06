// src/models/BabyProfile.ts
import { z } from 'zod'

export const BabyProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthDate: z.string(), // YYYY-MM-DD
  sleepType: z.enum(['regular', 'sensitive', 'short']),
  personality: z.enum(['calm', 'active', 'mixed']).optional(),
  createdAt: z.string(),
})

export type BabyProfile = z.infer<typeof BabyProfileSchema>
