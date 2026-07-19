'use client';

import * as React from 'react';
import { IconButton } from '@mui/material';

type Props = {
  onClick: () => void;
};

const TwoLineMenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="17" x2="16" y2="17" />
  </svg>
);

const MobileMenuTrigger = ({ onClick }: Props) => (
  <IconButton
    onClick={onClick}
    size="small"
    sx={{
      position: 'fixed',
      top: 16,
      left: 0,
      zIndex: 1100,
      backgroundColor: '#5F4AFE',
      color: '#fff',
      boxShadow: '4px 4px 10px rgba(0,0,0,0.15)',
      borderRadius: '0 4px 4px 0',
      width: '42px',
      height: '40px',
      '&::after': {
        content: '""',
        position: 'absolute',
        right: '-20px',
        top: 0,
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: '20px 0 20px 20px',
        borderColor: 'transparent transparent transparent #5F4AFE',
        transition: 'border-color 0.2s ease-in-out',
      },

      '&:hover': {
        backgroundColor: '#4B38CA',
        '&::after': {
          borderColor: 'transparent transparent transparent #4B38CA',
        },
      },
    }}
  >
    <TwoLineMenuIcon />
  </IconButton>
);

export default MobileMenuTrigger;
