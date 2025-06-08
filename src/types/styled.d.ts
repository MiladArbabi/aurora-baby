// src/types/styled.d.ts
import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      background: string;
      secondaryBackground: string; 
      accent: string;
      secondaryAccent: string; 
      tertiaryAccent: string; 
      text: string;
      contrastText: string;
      border: string;
      highlight: string;
      muted: string;
      aiGenerated: string;
      darkPrimary: string; 
      darkBackground: string; 
      darkAccent: string; 
      darkText: string; 
      darkContrastText: string; 
      navBackground: string;
      iconActive: string;
      iconInactive: string;
      error: string;
      trackerAwake: string;
      trackerSleep: string;
      trackerFeed: string;
      trackerDiaper: string;
      trackerEssentials: string;
      trackerTalk: string;
      trackerCare: string;
      trackerArc: string;
      trackerTick: string;
    };
    fonts: {
      regular: string;
      bold: string;
      inter: string;
      sizes: {
        title: number;
        headline: number;
        subtext: number;
        body: number;
        small: number;
      };
    };
    spacing: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
      xsmall: number;
    };
    sizes: {
      cardWidth: number;
      cardHeight: number;
      topNavHeight: number;
      bottomNavHeight: number;
      miniCardWidth: number; 
      miniCardHeight: number; 
    };
    carousel: {
      main: { w: number; h: number; r: number };
      feature: { w: number; h: number; r: number };
      category: { w: number; h: number; r: number };
      game: { w: number; h: number; r: number };
      stroke: number;
    };

    card: {
      large: { widthFactor: number; heightFactor: number; borderRadius: number };
      common: { widthFactor: number; heightFactor: number; borderRadius: number };
      medium: { widthFactor: number; heightFactor: number; borderRadius: number };
      game: { widthFactor: number; heightFactor: number; borderRadius: number };
    };
    
    mode: string;
  }
}

declare module '@rneui/themed' {
  export type ThemeMode = 'light' | 'dark' | 'system';
  export interface ThemeSpacing {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  }
  export interface Theme {
    colors: {
      primary: string;
      background: string;
    };
    spacing: ThemeSpacing;
    mode: ThemeMode;
  }
  export const ThemeProvider: React.FC<{ theme: Theme; children: React.ReactNode }>;
}