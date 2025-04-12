// src/types/rne-themed.d.ts
import { ThemeMode } from '@rneui/themed';

declare module '@rneui/themed' {
  interface CreateThemeOptions {
    colors?: {
      primary?: string;
      background?: string;
      [key: string]: string | undefined;
    };
    mode?: 'light' | 'dark'; // Explicitly define mode as a literal union
  }
}

export {};