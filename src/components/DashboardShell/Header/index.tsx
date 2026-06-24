'use client';

import { useState } from 'react';

import styled from '@emotion/styled';
import { KeyboardArrowDown } from '@mui/icons-material';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Box, Button, IconButton, Tooltip, useTheme } from '@mui/material';

import SupportMenu from './SupportMenu';
import UserMenu from './UserMenu';
import { UserTypes } from '@/types/user';

type HeaderProps = {
  toggleTheme: () => void;
  toggleDrawer: () => void;
  mode: 'light' | 'dark' | null;
  user: UserTypes.ICleanUser | null;
};
const Header = ({ toggleTheme, toggleDrawer, mode, user }: HeaderProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [supportAnchorEl, setSupportAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const supportOpen = Boolean(supportAnchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSupportOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSupportAnchorEl(event.currentTarget);
  };

  const handleSupportClose = () => setSupportAnchorEl(null);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        px: 3,
        py: 1,
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
      }}
    >
      <StyledIconButton onClick={toggleDrawer}>
        <MenuIcon />
      </StyledIconButton>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Tooltip title="Destek / İletişim">
          <StyledIconButton onClick={handleSupportOpen}>
            <SupportAgentIcon />
          </StyledIconButton>
        </Tooltip>

        <SupportMenu handleClose={handleSupportClose} open={supportOpen} anchorEl={supportAnchorEl} />

        <StyledIconButton onClick={toggleTheme}>{mode === 'light' ? <NightlightRoundIcon /> : <LightModeIcon />}</StyledIconButton>

        <Button
          onClick={handleOpen}
          endIcon={
            <KeyboardArrowDown
              sx={{
                transform: open ? 'rotate(180deg)' : 'none',
                transition: '0.2s',
              }}
            />
          }
          sx={{ textTransform: 'none', color: 'inherit', fontWeight: 500 }}
        >
          {`${user?.firstName} ${user?.lastName?.charAt(0)}.`}
        </Button>

        <UserMenu handleClose={handleClose} open={open} anchorEl={anchorEl} />
      </Box>
    </Box>
  );
};

export default Header;

const StyledIconButton = styled(IconButton)`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.05);
`;
