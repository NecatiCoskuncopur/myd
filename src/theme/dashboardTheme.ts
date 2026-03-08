import { createTheme } from '@mui/material/styles';

const getDashboardTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,

      dashboard: {
        sidebar: mode === 'light' ? '#ffffff' : '#1F1F21',
        content: mode === 'light' ? '#F4F4F7' : '#161618',
      },
    },
  });

export default getDashboardTheme;
