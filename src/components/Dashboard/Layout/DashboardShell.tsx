'use client';

import { useEffect, useMemo, useState } from 'react';

import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';

import getDashboardTheme from '@/theme/dashboardTheme';
import Header from './Header';
import SideMenu from './SideMenu';
import SupportFab from './SupportFab';

type Props = {
  children: React.ReactNode;
  role: IUserRole['role'] | '';
};

const DashboardShell = ({ children, role }: Props) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark' | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      setMode(savedTheme);
    } else {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('dashboard-theme', newMode);
  };

  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  const theme = useMemo(() => {
    return getDashboardTheme(mode || 'light');
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SideMenu role={role} open={isDrawerOpen} toggleDrawer={toggleDrawer} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: theme.palette.dashboard.content,
            minWidth: 0,
          }}
        >
          <Header toggleDrawer={toggleDrawer} toggleTheme={toggleTheme} mode={mode} />
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
          <SupportFab />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardShell;
