'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Divider, Drawer, List, useMediaQuery, useTheme } from '@mui/material';

import signOut from '@/app/actions/auth/signOut';
import { getSidebarItems } from '@/constants';
import { UserTypes } from '@/types/user';

import MobileMenuTrigger from './MobileMenuTrigger';
import MenuHeader from './MenuHeader';
import MenuItems from './MenuItems';
import MenuFooter from './MenuFooter';

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 70;

type Props = {
  role: UserTypes.IUser['role'] | '';
  open: boolean;
  toggleDrawer: () => void;
  toggleTheme: () => void;
  mode: 'light' | 'dark' | null;
  userName: string;
};

const SideMenu = ({ role, open, toggleDrawer, toggleTheme, mode, userName }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);

  const isExpanded = isMobile || open;
  const menuItems = React.useMemo(() => getSidebarItems(role), [role]);

  const handleToggle = (key: string): void => {
    if (!isExpanded) {
      toggleDrawer();
      setOpenKeys([key]);
      return;
    }
    setOpenKeys(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  const handleNavigate = (item: UserTypes.ISidebarItem): void => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      if (item.external) {
        window.open(item.path, '_blank');
      } else {
        router.push(item.path);
      }
    }
    if (isMobile) toggleDrawer();
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    router.push('/kullanici/giris');
  };

  return (
    <>
      {isMobile && !open && <MobileMenuTrigger onClick={toggleDrawer} />}

      <Box
        component="nav"
        sx={{
          width: isMobile ? 0 : isExpanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeInOut,
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
              width: isMobile ? DRAWER_WIDTH : isExpanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
              backgroundImage: 'none',
              backgroundColor: theme.palette.dashboard.sidebar,
              color: theme.palette.dashboard.textSidebar,
              boxSizing: 'border-box',
              borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
              '& .MuiListItemIcon-root': {
                justifyContent: 'center',
                color: theme.palette.dashboard.textSidebar,
              },
              '& .MuiListItemButton-root': { borderRadius: 2 },
              '& .Mui-selected': {
                backgroundColor: '#5F4AFE !important',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
            },
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <MenuHeader isExpanded={isExpanded} onToggle={toggleDrawer} />
            <Divider />

            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: isExpanded ? '20px 15px' : '20px 8px',
                transition: theme.transitions.create('padding', {
                  easing: theme.transitions.easing.easeInOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }}
            >
              <List>
                <MenuItems
                  items={menuItems}
                  isExpanded={isExpanded}
                  openKeys={openKeys}
                  pathname={pathname}
                  onToggle={handleToggle}
                  onNavigate={handleNavigate}
                />
              </List>
            </Box>

            <MenuFooter isExpanded={isExpanded} userName={userName} mode={mode} toggleTheme={toggleTheme} onSignOut={handleSignOut} />
          </Box>
        </Drawer>
      </Box>
    </>
  );
};

export default SideMenu;
