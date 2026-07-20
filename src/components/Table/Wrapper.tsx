import React from 'react';
import { Box, useTheme } from '@mui/material';

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 48px)',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
        p: { xs: 2.5, md: 4 },
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
};

export default Wrapper;
