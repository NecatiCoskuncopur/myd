'use client';

import * as React from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

type Props = {
  onClick: () => void;
};

const MobileMenuHeader = ({ onClick }: Props) => {
  return (
    <Box
      component="header"
      sx={theme => ({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        backgroundColor: theme.palette.dashboard?.content,
        color: theme.palette.dashboard?.textSidebar,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      })}
    >
      <IconButton onClick={onClick} edge="start" color="inherit" aria-label="open drawer">
        <MenuIcon />
      </IconButton>
    </Box>
  );
};

export default MobileMenuHeader;
