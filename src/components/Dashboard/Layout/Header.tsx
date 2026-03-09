'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import styled from '@emotion/styled';
import { AttachMoney, FormatListNumbered, KeyboardArrowDown, Logout, Person, RocketLaunch } from '@mui/icons-material';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import { Box, Button, Divider, IconButton, Link, ListItemIcon, Menu, MenuItem, Skeleton, useTheme } from '@mui/material';

import signOut from '@/app/actions/auth/signOut';
import getUser from '@/app/actions/user/getUser';
import { messages } from '@/constants';

type HeaderProps = {
  toggleTheme: () => void;
  toggleDrawer: () => void;
  mode: 'light' | 'dark' | null;
};

const { GENERAL, USER } = messages;

const Header = ({ toggleTheme, toggleDrawer, mode }: HeaderProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const [pending, startTransition] = useTransition();

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/kullanici/giris');
  };

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
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          disableScrollLock
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: { mt: 1.5, minWidth: 180, borderRadius: 2 },
          }}
        >
          <MenuItem component={Link} href="/panel/hesabim" onClick={handleClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Hesabım
          </MenuItem>
          <MenuItem component={Link} href="/panel/gönderilerim" onClick={handleClose}>
            <ListItemIcon>
              <RocketLaunch fontSize="small" />
            </ListItemIcon>
            Gönderilerim
          </MenuItem>
          <MenuItem component={Link} href="/panel/cari-hesabım" onClick={handleClose}>
            <ListItemIcon>
              <AttachMoney fontSize="small" />
            </ListItemIcon>
            Cari Hesabım
          </MenuItem>
          <MenuItem component={Link} href="/panel/fiyat-listem" onClick={handleClose}>
            <ListItemIcon>
              <FormatListNumbered fontSize="small" />
            </ListItemIcon>
            Fiyat Listem
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleClose} sx={{ color: 'error.main' }}>
            <ListItemIcon onClick={handleSignOut}>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            Çıkış Yap
          </MenuItem>
        </Menu>
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
