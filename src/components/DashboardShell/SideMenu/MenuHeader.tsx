'use client';

import * as React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

type Props = {
  isExpanded: boolean;
  onToggle: () => void;
};

const MenuHeader = ({ isExpanded, onToggle }: Props) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: isExpanded ? 'space-between' : 'center',
      p: 2,
      minHeight: 64,
    }}
  >
    {isExpanded && (
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        MYD Export
      </Typography>
    )}
    <IconButton onClick={onToggle}>{isExpanded ? <ChevronLeft /> : <ChevronRight />}</IconButton>
  </Box>
);

export default MenuHeader;
