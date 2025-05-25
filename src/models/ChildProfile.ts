//src/models/ChildProfile.ts
import { z } from 'zod'
export const ChildProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  dob: z.string().refine(d => !isNaN(Date.parse(d))),
  themePreferences: z.array(z.string()).optional(),
})
export type ChildProfile = z.infer<typeof ChildProfileSchema>
