'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';

import getDashboardTheme from '@/theme';
import { UserTypes } from '@/types/user';

import SideMenu from './SideMenu';

type DashboardShellProps = {
  children: React.ReactNode;
  user?: UserTypes.UserDto;
};

const DashboardShell = ({ children, user }: DashboardShellProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setMode] = useState<'light' | 'dark' | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement;

      if (target instanceof HTMLInputElement && target.type === 'number' && document.activeElement === target) {
        event.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, {
      passive: false,
    });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard-theme');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme);
      return;
    }

    setMode(prefersDarkMode ? 'dark' : 'light');
  }, [prefersDarkMode]);

  const theme = useMemo(() => getDashboardTheme(mode ?? 'light'), [mode]);

  const toggleTheme = () => {
    setMode(currentMode => {
      const newMode = currentMode === 'dark' ? 'light' : 'dark';

      localStorage.setItem('dashboard-theme', newMode);

      return newMode;
    });
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(current => !current);
  };

  if (mode === null) {
    return null;
  }

  const userName = user ? `${user.firstName} ${user.lastName?.charAt(0) ?? ''}.` : '';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        <SideMenu role={user?.role ?? ''} open={isDrawerOpen} toggleDrawer={toggleDrawer} toggleTheme={toggleTheme} mode={mode} userName={userName} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: theme.palette.dashboard.content,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              paddingTop: {
                xs: '56px',
                sm: '70px',
                md: 3,
              },
              px: {
                xs: 0,
                sm: 2,
                md: 3,
              },
              paddingBottom: {
                xs: 0,
                sm: 2,
                md: 3,
              },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardShell;
