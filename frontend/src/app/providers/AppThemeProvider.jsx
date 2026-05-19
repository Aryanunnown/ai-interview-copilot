import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useThemeModeStore } from '../store/useThemeModeStore.js';

function buildTheme(mode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#7dd3fc' : '#2563eb',
      },
      secondary: {
        main: isDark ? '#5eead4' : '#0f766e',
      },
      success: {
        main: '#16a34a',
      },
      warning: {
        main: '#d97706',
      },
      background: {
        default: isDark ? '#07111f' : '#f4f7fb',
        paper: isDark ? '#0c1726' : '#ffffff',
      },
      text: {
        primary: isDark ? '#eef6ff' : '#111827',
        secondary: isDark ? '#9fb1c7' : '#5b6472',
      },
      divider: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h3: {
        fontWeight: 800,
        letterSpacing: 0,
      },
      h4: {
        fontWeight: 800,
        letterSpacing: 0,
      },
      h5: {
        fontWeight: 750,
        letterSpacing: 0,
      },
      h6: {
        fontWeight: 750,
        letterSpacing: 0,
      },
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

export function AppThemeProvider({ children }) {
  const mode = useThemeModeStore((state) => state.mode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
