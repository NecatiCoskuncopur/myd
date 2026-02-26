'use client';

import * as React from 'react';

import { Box, useMediaQuery } from '@mui/material';

import { UserRole } from '@/lib/getCurrentUser';
import Footer from './Footer';
import SideMenu from './SideMenu';

type Props = {
  children: React.ReactNode;
  role: UserRole | '';
};

const DashboardShell = ({ children, role }: Props) => {
  const isMobile = useMediaQuery('(max-width:1023px)');
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
      <SideMenu role={role} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          marginTop: isMobile ? 5 : 0,
        }}
      >
        <Box sx={{ flex: 1 }}>{children}</Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default DashboardShell;
