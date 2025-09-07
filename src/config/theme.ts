import { DefaultTheme } from '@react-navigation/native';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#ffffff',
    text: '#2c3e50',
    border: '#bdc3c7',
    error: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 32,
  },
  textVariants: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 12,
    },
  },
} as const;

export type Theme = typeof theme;
declare module '@react-navigation/native' {
  export function useTheme(): Theme;
}
