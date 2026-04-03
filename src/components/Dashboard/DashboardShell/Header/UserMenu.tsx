'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AttachMoney, FormatListNumbered, Logout, Person, RocketLaunch } from '@mui/icons-material';
import { Divider, ListItemIcon, Menu, MenuItem } from '@mui/material';

import signOut from '@/app/actions/auth/signOut';

type UserMenuProps = {
  handleClose: () => void;
  open: boolean;
  anchorEl: HTMLElement | null;
};

const UserMenu = ({ handleClose, open, anchorEl }: UserMenuProps) => {
  const router = useRouter();

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/kullanici/giris');
  };

  return (
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
      <MenuItem
        onClick={() => {
          handleClose();
          handleSignOut();
        }}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon>
          <Logout fontSize="small" color="error" />
        </ListItemIcon>
        Çıkış Yap
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
