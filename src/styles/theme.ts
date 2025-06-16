//src/styles/theme.ts
import { Theme } from '@rneui/themed';

export const colors = {
  // Light Mode
  primary: '#B3A5C4', // Lavender
  background: '#E6E1F4', // Light Lavender
  secondaryBackground: '#453F4E', // Dark Lavender
  accent: '#A3FFF6', // Teal
  secondaryAccent: '#E6E1F4', // Light Lavender
  tertiaryAccent: '#00ADEE', // Dusty Blue
  warning: '#FFB400',    // ⚠️ for diaper/mood “warnings”
  error:   '#F44336',    // 🛑 for health errors
  info:    '#2196F3',    // ℹ️ for notes/info
  text: '#453F4E', // Dark Lavender for light mode text
  contrastText: '#E6E1F4', // Light Lavender for Dark Mode text
  border: '#D3C8E5', // Softer Lavender
  highlight: '#FFB6C1', // Light Pink
  muted: '#A9A9A9', // Gray
  aiGenerated: '#FFD700', // Sunny Gold

  // Dark Mode
  darkPrimary: '#008080', // Teal
  darkBackground: '#2F2346', // Dark Lavender (adjusted for contrast)
  darkAccent: '#FFD1B3', // Peach
  darkText: '#E9DAFA', // Light Lavender for dark mode text
  darkContrastText: '#E9DAFA', // Light Lavender

  // Bottomnav Colors
  navBackground: '#2F2346',
  iconActive:    '#A4B9CC',
  iconInactive:  '#A9A9A9',

  // ───── Tracker-specific palette ─────────────────────────────
  trackerAwake:     '#ECCE8E',        // Sky Blue (outer rim – wake)
  trackerSleep:     '#734F96',        // Dark Lavender (Aurora – outer rim sleep)
  trackerFeed:      '#228B22',        // Forest Green (2nd rim – feed/food)
  trackerDiaper:    '#00BFFF',        // Deep Sky Blue (2nd rim – diaper/water)
  trackerCare:      '#F8F8FF',        // Off White (inner rim – care)
  trackerEssentials:'#8a7475',        // Brown (inner rim – essentials)
  trackerTalk:      '#AFEEEE',        // Pale Turquoise (inner rim – talk/clear water)
  trackerArc:       '#FFFFFF', 
  trackerTick:       'rgba(0,0,0,0.8)'  

} as const;

export const fonts = {
  regular: 'Edrosa',
  bold: 'Edrosa',
  inter: 'Inter-Regular',
  sizes: {
    title: 24,
    headline: 30,
    subtext: 18,
    body: 16,
    small: 12,
  },
} as const;

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xsmall: 4,
} as const;

export const sizes = {
  cardWidth: 300,
  cardHeight: 200,
  topNavHeight: 60,
  bottomNavHeight: 50,
  miniCardWidth: 100, // For optimization/self-care cards
  miniCardHeight: 200,
} as const;

// ---- carousel config ----
export const carousel = {
  main:    { w: 0.9, h: 0.55, r: 10, strokeColor: '#FFFFFF', center: true },
  feature: { w: 0.25, h: 0.2, r: 5 },
  category:{ w: 0.4, h: 0.4, r: 5 },
  game:    { w: 0.2, h: 0.1, r: 10 },
  stroke:  1,
} as const;

export const theme = {
  colors,
  fonts,
  spacing,
  sizes,
  carousel,
  mode: 'light',
  card: {
    // used by ReusableCarousel “main” (big hero card):
    large: {
      widthFactor: 0.93,    // screenW * 0.9
      heightFactor: 0.55,  // screenH * 0.55
      borderRadius: 10,
    },
    // “feature” / common cards:
    common: {
      widthFactor: 0.28,
      heightFactor: 0.2,
      borderRadius: 10,
    },
    // category cards (a bit larger than common):
    // 👉 naming options: “medium”, “highlight”, “promo”
    medium: {
      widthFactor: 0.44,
      heightFactor: 0.33,
      borderRadius: 10,
    },
    // game cards:
    game: {
      widthFactor: 0.2,
      heightFactor: 0.1,
      borderRadius: 10,
    },
  },
} as const;

export const rneThemeBase: Theme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
  },
  spacing: {
    xs: spacing.xsmall,
    sm: spacing.small,
    md: spacing.medium,
    lg: spacing.large,
    xl: spacing.xlarge,
  },
  mode: 'light',
};

export const darkTheme: Theme = {
  colors: {
    primary: colors.darkPrimary,
    background: colors.darkBackground,
  },
  spacing: {
    xs: spacing.xsmall,
    sm: spacing.small,
    md: spacing.medium,
    lg: spacing.large,
    xl: spacing.xlarge,
  },
  mode: 'dark',
};