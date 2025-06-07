// src/models/BabyProfile.ts
import { z } from 'zod'

export const BabyProfileSchema = z.object({
  id:         z.string(),
  name:       z.string().min(1),
  birthDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sleepType:  z.enum(['regular','sensitive','short']).default('regular'),
  personality:z.enum(['calm','active','mixed']).optional(),
  createdAt:  z.string().default(() => new Date().toISOString()),
})

export type BabyProfile = z.infer<typeof BabyProfileSchema>
