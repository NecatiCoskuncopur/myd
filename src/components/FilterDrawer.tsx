'use client';

import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Divider, Drawer, IconButton, Typography } from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

import { StyledButton } from '@/components';

type FilterDrawerProps = {
  open: boolean;
  title?: string;
  isFiltered: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onReset: () => void;
  children: ReactNode;
};

const FilterDrawer = ({ open, title = 'Filtrele', isFiltered, onClose, onSubmit, onReset, children }: FilterDrawerProps) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: theme => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
            width: { xs: '100%', sm: 360 },
          }),
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>{children}</Box>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
          <StyledButton type="button" fullWidth variant="outlined" startIcon={<RestartAltIcon />} disabled={!isFiltered} onClick={onReset}>
            Sıfırla
          </StyledButton>

          <StyledButton type="submit" fullWidth variant="contained" startIcon={<SearchIcon />}>
            Ara
          </StyledButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
