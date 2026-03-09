'use client';

import * as React from 'react';

import { Email, Phone, WhatsApp } from '@mui/icons-material';
import { Box, SpeedDial, SpeedDialAction } from '@mui/material';

import { company } from '@/constants';

type SupportAction = {
  icon: React.ReactNode;
  name: string;
  link: string;
};

const actions: SupportAction[] = [
  {
    icon: <WhatsApp />,
    name: 'WhatsApp',
    link: company.whatsappLink,
  },
  {
    icon: <Email />,
    name: 'E-Posta',
    link: company.emailLink,
  },
  {
    icon: <Phone />,
    name: 'Telefon',
    link: company.phoneLink,
  },
];

const SupportFab = () => {
  const handleClick = (link: string): void => {
    window.open(link, '_blank');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300,
      }}
    >
      <SpeedDial
        ariaLabel="destek"
        icon={<WhatsApp />}
        direction="up"
        FabProps={{
          color: 'success',
        }}
      >
        {actions.map(action => (
          <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={() => handleClick(action.link)} />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default SupportFab;
