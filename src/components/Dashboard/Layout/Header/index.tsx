'use client';

import { useEffect, useState, useTransition } from 'react';

import styled from '@emotion/styled';
import { KeyboardArrowDown } from '@mui/icons-material';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import { Box, Button, IconButton, Skeleton, useTheme } from '@mui/material';

import getUser from '@/app/actions/user/getUser';
import { messages } from '@/constants';
import UserMenu from './UserMenu';

type HeaderProps = {
  toggleTheme: () => void;
  toggleDrawer: () => void;
  mode: 'light' | 'dark' | null;
};

const { GENERAL, USER } = messages;

const Header = ({ toggleTheme, toggleDrawer, mode }: HeaderProps) => {
  const theme = useTheme();
  const [user, setUser] = useState<IUser | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pending, startTransition] = useTransition();

  const open = Boolean(anchorEl);

  useEffect(() => {
    startTransition(async () => {
      try {
        const response = await getUser();
        if (response.status === 'ERROR') {
          console.error(USER.NOT_FOUND);
          return;
        }
        setUser(response?.data ?? null);
      } catch (error) {
        console.error(GENERAL.UNEXPECTED_ERROR, error);
      }
    });
  }, []);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

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
      <Box display="flex" gap={2} alignItems="center">
        <StyledIconButton onClick={toggleTheme}>{mode === 'light' ? <NightlightRoundIcon /> : <LightModeIcon />}</StyledIconButton>
        {!pending && (
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
            {user ? `${user.firstName} ${user.lastName?.charAt(0)}.` : <Skeleton width={100} height={30} />}
          </Button>
        )}
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
