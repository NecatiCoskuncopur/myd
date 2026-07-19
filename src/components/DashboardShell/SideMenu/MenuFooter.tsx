'use client';

import * as React from 'react';
import { Box, Divider, IconButton, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  AccountCircle,
  LightMode as LightModeIcon,
  NightlightRound as NightlightRoundIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Logout,
} from '@mui/icons-material';
import { company } from '@/constants';

type Props = {
  isExpanded: boolean;
  userName: string;
  mode: 'light' | 'dark' | null;
  toggleTheme: () => void;
  onSignOut: () => Promise<void>;
};

const MenuFooter = ({ isExpanded, userName, mode, toggleTheme, onSignOut }: Props) => (
  <Box sx={{ p: isExpanded ? 2 : 1 }}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: isExpanded ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        gap: isExpanded ? 0 : 1.5,
        px: isExpanded ? 1 : 0,
      }}
    >
      {isExpanded && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountCircle />
          <Typography variant="body2" noWrap sx={{ fontWeight: 600, maxWidth: 140 }}>
            {userName}
          </Typography>
        </Box>
      )}

      <IconButton onClick={toggleTheme} color="inherit" size="small">
        {mode === 'light' ? <NightlightRoundIcon /> : <LightModeIcon />}
      </IconButton>
    </Box>

    <Divider sx={{ my: 1.5 }} />
    <Box
      sx={{
        display: 'flex',
        flexDirection: isExpanded ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        gap: isExpanded ? 0 : 1.5,
        px: isExpanded ? 2 : 0,
        my: 1,
      }}
    >
      {company?.whatsappLink && (
        <IconButton component="a" href={company.whatsappLink} target="_blank" rel="noopener noreferrer" color="inherit" size="small">
          <WhatsAppIcon fontSize="small" />
        </IconButton>
      )}
      {company?.phoneLink && (
        <IconButton component="a" href={`tel:${company.phoneLink}`} color="inherit" size="small">
          <PhoneIcon fontSize="small" />
        </IconButton>
      )}
      {company?.emailLink && (
        <IconButton component="a" href={`mailto:${company.emailLink}`} color="inherit" size="small">
          <EmailIcon fontSize="small" />
        </IconButton>
      )}
    </Box>

    <Divider sx={{ my: 1.5 }} />
    <ListItemButton onClick={onSignOut} sx={{ borderRadius: 2, justifyContent: isExpanded ? 'initial' : 'center', px: isExpanded ? 2 : 0 }}>
      <ListItemIcon sx={{ mr: isExpanded ? 3 : 0, minWidth: 0 }}>
        <Logout />
      </ListItemIcon>
      {isExpanded && <ListItemText primary={<Typography sx={{ fontWeight: 500, letterSpacing: '0.02em' }}>Çıkış Yap</Typography>} />}
    </ListItemButton>
  </Box>
);

export default MenuFooter;
