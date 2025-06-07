// src/services/BabyProfileAccess.ts
import {
    saveBabyProfile,
    getBabyProfile,
    deleteBabyProfile,
  } from '../storage/BabyProfileStorage'
  import { BabyProfile } from '../models/BabyProfile'
  
  export const createProfile = saveBabyProfile
  export const readProfile   = getBabyProfile
  export const updateProfile = saveBabyProfile
  export const removeProfile = deleteBabyProfile
export const profileExists = async (): Promise<boolean> => {
  const profile = await getBabyProfile()
  return profile !== null
}

export const getProfileId = async (): Promise<string | null> => {
  const profile = await getBabyProfile()
  return profile ? profile.id : null
}



  