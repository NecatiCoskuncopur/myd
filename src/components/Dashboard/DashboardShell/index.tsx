'use client';

import { useEffect, useMemo, useState } from 'react';

import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';

import getUser from '@/app/actions/user/getUser';
import getDashboardTheme from '@/theme';
import Header from './Header';
import SideMenu from './SideMenu';
import SupportFab from './SupportFab';

type Props = {
  children: React.ReactNode;
};

const DashboardShell = ({ children }: Props) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark' | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [user, setUser] = useState<UserTypes.IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initShell = async () => {
      setLoading(true);
      try {
        const response = await getUser();
        if (response.status === 'OK') {
          setUser(response.data ?? null);
        }

        const savedTheme = localStorage.getItem('dashboard-theme') as 'light' | 'dark' | null;
        if (savedTheme) {
          setMode(savedTheme);
        } else {
          setMode(prefersDarkMode ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Shell Initialization Error:', error);
      } finally {
        setLoading(false);
      }
    };

    initShell();
  }, [prefersDarkMode]);

  const theme = useMemo(() => getDashboardTheme(mode || 'light'), [mode]);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('dashboard-theme', newMode);
  };

  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);
  if (mode === null) return null; // LOADING GELECEK

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SideMenu role={user?.role || ''} open={isDrawerOpen} toggleDrawer={toggleDrawer} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            backgroundColor: theme.palette.dashboard.content,
            minWidth: 0,
          }}
        >
          <Header toggleDrawer={toggleDrawer} toggleTheme={toggleTheme} mode={mode} user={user || null} />
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
