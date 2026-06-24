'use client';

import { Email, Phone, WhatsApp } from '@mui/icons-material';
import { ListItemIcon, Menu, MenuItem } from '@mui/material';

import { company } from '@/constants';

type SupportMenuProps = {
  handleClose: () => void;
  open: boolean;
  anchorEl: HTMLElement | null;
};

type SupportAction = {
  icon: React.ReactNode;
  name: string;
  link: string;
};

const actions: SupportAction[] = [
  {
    icon: <WhatsApp fontSize="small" sx={{ color: 'success.main' }} />,
    name: 'WhatsApp',
    link: company.whatsappLink,
  },
  {
    icon: <Email fontSize="small" />,
    name: 'E-Posta',
    link: company.emailLink,
  },
  {
    icon: <Phone fontSize="small" />,
    name: 'Telefon',
    link: company.phoneLink,
  },
];

const SupportMenu = ({ handleClose, open, anchorEl }: SupportMenuProps) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      disableScrollLock
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      slotProps={{
        paper: { elevation: 3, sx: { mt: 1.5, minWidth: 180, borderRadius: 2 } },
      }}
    >
      {actions.map(action => {
        const isExternal = action.link.startsWith('http');

        return (
          <MenuItem
            key={action.name}
            component="a"
            href={action.link}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            onClick={handleClose}
          >
            <ListItemIcon>{action.icon}</ListItemIcon>
            {action.name}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default SupportMenu;
