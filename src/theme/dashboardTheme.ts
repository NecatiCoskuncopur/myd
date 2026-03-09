import { createTheme } from '@mui/material/styles';

const getDashboardTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      dashboard: {
        sidebar: mode === 'light' ? '#ffffff' : '#1F1F21',
        content: mode === 'light' ? '#F4F4F7' : '#161618',
        textSidebar: mode === 'light' ? '#57575A' : '#A6A5B2',
      },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
  });

export default getDashboardTheme;
