'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { ChevronLeft, ChevronRight, ExpandLess, ExpandMore, Menu } from '@mui/icons-material';
import { Box, Collapse, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from '@mui/material';

import signOut from '@/app/actions/auth/signOut';
import { getSidebarItems } from '@/constants';
import { UserRole } from '@/lib/getCurrentUser';

const drawerWidth = 240;
const collapsedWidth = 72;

type Props = {
  role: UserRole | '';
};

const SideMenu = ({ role }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width:1023px)');

  const [openKeys, setOpenKeys] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState<boolean>(true);
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  const handleToggle = (key: string): void => {
    setOpenKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/kullanici/giris');
  };

  const menuItems = React.useMemo(() => getSidebarItems(role, handleSignOut), [role]);

  const handleNavigate = (item: ISidebarItem): void => {
    if (item.action) {
      item.action();
      return;
    }

    if (!item.path) return;

    if (item.external) {
      window.open(item.path, '_blank');
      return;
    }

    router.push(item.path);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderItems = (items: ISidebarItem[], depth = 0): React.ReactNode =>
    items.map(item => {
      const isOpen = openKeys.includes(item.key);
      const isSelected = item.path === pathname;

      if (item.children) {
        return (
          <React.Fragment key={item.key}>
            <ListItemButton onClick={() => handleToggle(item.key)} sx={{ pl: 2 + depth * 2 }}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              {(open || isMobile) && <ListItemText primary={item.label} />}
              {(open || isMobile) && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            <Collapse in={isOpen && (open || isMobile)} timeout="auto" unmountOnExit>
              <List disablePadding>{renderItems(item.children, depth + 1)}</List>
            </Collapse>
          </React.Fragment>
        );
      }

      return (
        <ListItemButton key={item.key} selected={isSelected} sx={{ pl: 2 + depth * 2 }} onClick={() => handleNavigate(item)}>
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          {(open || isMobile) && <ListItemText primary={item.label} />}
        </ListItemButton>
      );
    });

  const commonDrawerStyles = {
    width: {
      xs: '100%',
      sm: '50%',
      md: open ? drawerWidth : collapsedWidth,
    },
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
      width: {
        xs: '100%',
        sm: '50%',
        md: open ? drawerWidth : collapsedWidth,
      },
      overflowX: 'hidden',
      backgroundColor: '#001529',
      color: '#fff',
      boxSizing: 'border-box',
    },

    '& .MuiListItemIcon-root': {
      minWidth: 0,
      mr: open || isMobile ? 3 : 'auto',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.65)',
    },

    '& .MuiListItemButton-root': {
      minHeight: 48,
      justifyContent: open || isMobile ? 'initial' : 'center',
    },

    '& .MuiListItemText-root': {
      opacity: open || isMobile ? 1 : 0,
    },

    '& .Mui-selected': {
      backgroundColor: '#1677ff !important',
      color: '#fff',
    },
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open || isMobile ? 'space-between' : 'center',
          p: 2,
        }}
      >
        {(open || isMobile) && (
          <Typography variant="h6" sx={{ color: '#fff' }}>
            MYD Export
          </Typography>
        )}

        {!isMobile && (
          <IconButton onClick={() => setOpen(prev => !prev)} sx={{ color: '#fff' }}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List>{renderItems(menuItems)}</List>
    </>
  );

  return (
    <>
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
          }}
        >
          <Menu />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={commonDrawerStyles}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default SideMenu;
