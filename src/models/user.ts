// src/models/user.ts
export interface UserPreferences {
    sttEnabled: boolean;
    ttsSpeed: 'slow' | 'normal' | 'fast';
    language: string;
    autoLogPlay: boolean;
    smartReminders: boolean;
    quietMode: boolean;
  }
  
  export interface ChildProfile {
    id: string;
    name: string;
    dob: string; // ISO date
    interests: string[];
    persona: 'Explorer' | 'Dreamer' | 'Builder' | null;
    avatar: string;
  }
  
  export interface UserProfile {
    id: string;
    name: string;
    preferences: UserPreferences;
    child: ChildProfile;
  }
  