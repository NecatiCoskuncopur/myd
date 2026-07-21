import React from 'react';
import { Box, Typography, useTheme, Grid } from '@mui/material';

type WrapperProps = {
  children: React.ReactNode;
  title: string;
};

const Wrapper = ({ children, title }: WrapperProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        borderBottom: `1px solid ${theme.palette.dashboard.border}`,
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 2,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.035)',
          borderBottom: `1px solid ${theme.palette.dashboard.border}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ p: 2, m: 0, width: '100%' }}>
        {children}
      </Grid>
    </Box>
  );
};

export default Wrapper;
