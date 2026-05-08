import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

type CardHeaderProps = {
  children: React.ReactNode;
  title: string;
};

const CardHeader = ({ children, title }: CardHeaderProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        pb: '12px',
        borderBottom: `1px solid ${theme.palette.dashboard.border}`,
      }}
    >
      {children}
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
};

export default CardHeader;
