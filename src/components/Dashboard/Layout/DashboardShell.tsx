'use client';

import { useEffect, useMemo, useState } from 'react';

import styled from '@emotion/styled';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import { Box, CssBaseline, IconButton, ThemeProvider, useMediaQuery } from '@mui/material';

import getDashboardTheme from '@/theme/dashboardTheme';

type Props = {
  children: React.ReactNode;
  role: IUserRole | '';
};

const DashboardShell = ({ children, role }: Props) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark' | null>(null);

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

  const theme = useMemo(() => {
    return getDashboardTheme(mode || 'light');
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.dashboard.content,
          }}
        >
          <Button onClick={toggleTheme}>{mode === 'light' ? <NightlightRoundIcon /> : <LightModeIcon />}</Button>
          <Box sx={{ flex: 1 }}>{children}</Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardShell;

const Button = styled(IconButton)`
  position: absolute;
  top: 20px;
  right: 20px;
  height: 40px;
  width: 40px;
  border-radius: 50%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.05);
`;
