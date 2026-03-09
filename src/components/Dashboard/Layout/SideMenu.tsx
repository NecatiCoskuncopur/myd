'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { ChevronLeft, ExpandLess, ExpandMore, Logout } from '@mui/icons-material';
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import signOut from '@/app/actions/auth/signOut';
import { getSidebarItems } from '@/constants';

const drawerWidth = 280;

type Props = {
  role: IUserRole['role'] | '';
  open: boolean;
  toggleDrawer: () => void;
};

const SideMenu = ({ role, open, toggleDrawer }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  const handleToggle = (key: string): void => {
    setOpenKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/kullanici/giris');
  };

  const signOutItem: ISidebarItem = {
    key: 'signout',
    label: 'Çıkış Yap',
    icon: <Logout />,
    action: handleSignOut,
  };

  const menuItems = React.useMemo(() => getSidebarItems(role), [role]);

  const handleNavigate = (item: ISidebarItem): void => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      if (item.external) {
        window.open(item.path, '_blank');
      } else {
        router.push(item.path);
      }
    }

    if (isMobile) {
      toggleDrawer();
    }
  };

  const renderItems = (items: ISidebarItem[], depth = 0): React.ReactNode =>
    items.map(item => {
      const isOpen = openKeys.includes(item.key);
      const isSelected = item.path === pathname;
      const showText = isMobile || open;

      if (item.children) {
        return (
          <React.Fragment key={item.key}>
            <ListItemButton onClick={() => handleToggle(item.key)} sx={{ pl: 2 + depth * 2 }}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              {showText && <ListItemText primary={item.label} />}
              {showText && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            <Collapse in={isOpen && showText} timeout="auto" unmountOnExit>
              <List disablePadding>{renderItems(item.children, depth + 1)}</List>
            </Collapse>
          </React.Fragment>
        );
      }

      return (
        <ListItemButton key={item.key} selected={isSelected} sx={{ pl: 2 + depth * 2 }} onClick={() => handleNavigate(item)}>
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          {showText && <ListItemText primary={item.label} />}
        </ListItemButton>
      );
    });

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open || isMobile ? 'space-between' : 'center',
          p: 2,
          minHeight: 64,
        }}
      >
        {(open || isMobile) && (
          <Typography variant="h6" fontWeight="bold">
            MYD Export
          </Typography>
        )}

        <IconButton onClick={toggleDrawer}>
          <ChevronLeft />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '20px 15px',
        }}
      >
        <List>{renderItems(menuItems)}</List>
      </Box>
      <Box sx={{ p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <List>{renderItems([signOutItem])}</List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: isMobile ? 0 : open ? drawerWidth : 0,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? drawerWidth : open ? drawerWidth : 0,
            backgroundImage: 'none',
            backgroundColor: theme.palette.dashboard.sidebar,
            color: theme.palette.dashboard.textSidebar,
            boxSizing: 'border-box',
            borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiListItemIcon-root': {
              minWidth: 0,
              mr: open || isMobile ? 3 : 'auto',
              justifyContent: 'center',
              color: theme.palette.dashboard.textSidebar,
            },
            '& .MuiListItemButton-root': {
              borderRadius: 2,
              justifyContent: open || isMobile ? 'initial' : 'center',
            },
            '& .Mui-selected': {
              backgroundColor: '#5F4AFE !important',
              color: '#fff',
              '& .MuiListItemIcon-root': { color: '#fff' },
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default SideMenu;
