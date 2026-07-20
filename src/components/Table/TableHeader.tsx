import React from 'react';

import { Box, Typography } from '@mui/material';
type TableHeaderProps = {
  children: React.ReactNode;
  title: string;
  subTitle: string;
};

const TableHeader = ({ children, title, subTitle }: TableHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        pb: 2.5,
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.25rem', md: '28px' },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mt: 0.5,
            fontSize: '0.875rem',
          }}
        >
          {subTitle}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};

export default TableHeader;
