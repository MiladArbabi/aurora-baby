// src/models/ParentProfile.ts
import { z } from 'zod'
export const ParentProfileSchema = z.object({
  id:   z.string(),
  name: z.string(),
  // add any other fields you collected (email, etc)
})
export type ParentProfile = z.infer<typeof ParentProfileSchema>
