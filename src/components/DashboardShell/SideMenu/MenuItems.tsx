'use client';

import * as React from 'react';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { UserTypes } from '@/types/user';

type Props = {
  items: UserTypes.ISidebarItem[];
  isExpanded: boolean;
  openKeys: string[];
  pathname: string;
  onToggle: (key: string) => void;
  onNavigate: (item: UserTypes.ISidebarItem) => void;
  depth?: number;
};

const MenuItems = ({ items, isExpanded, openKeys, pathname, onToggle, onNavigate, depth = 0 }: Props) => {
  const theme = useTheme();

  const transition = theme.transitions.create(['margin', 'padding', 'opacity'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.enteringScreen,
  });

  return (
    <>
      {items.map(item => {
        const isOpen = openKeys.includes(item.key);
        const isSelected = item.path === pathname;

        const buttonStyles = {
          minHeight: 44,
          justifyContent: isExpanded ? 'initial' : 'center',
          pl: isExpanded ? 2 + depth * 2 : 1.5,
          pr: isExpanded ? 2 : 1.5,
          transition,
        };

        // Kept mounted in both states so the label fades with the drawer instead of
        // popping in/out; overflowX:hidden on the paper clips it while collapsed.
        const iconStyles = {
          minWidth: 0,
          justifyContent: 'center',
          mr: isExpanded ? 3 : 'auto',
          ml: isExpanded ? 0 : 'auto',
          transition,
        };

        const label = (
          <ListItemText
            sx={{ my: 0, whiteSpace: 'nowrap', opacity: isExpanded ? 1 : 0, transition }}
            primary={<Typography sx={{ fontWeight: 500, letterSpacing: '0.02em' }}>{item.label}</Typography>}
          />
        );

        if (item.children) {
          return (
            <React.Fragment key={item.key}>
              <ListItemButton onClick={() => onToggle(item.key)} sx={buttonStyles}>
                {item.icon && <ListItemIcon sx={iconStyles}>{item.icon}</ListItemIcon>}
                {label}
                {isExpanded && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>

              <Collapse in={isOpen && isExpanded} timeout="auto" unmountOnExit>
                <List disablePadding>
                  <MenuItems
                    items={item.children}
                    isExpanded={isExpanded}
                    openKeys={openKeys}
                    pathname={pathname}
                    onToggle={onToggle}
                    onNavigate={onNavigate}
                    depth={depth + 1}
                  />
                </List>
              </Collapse>
            </React.Fragment>
          );
        }

        return (
          <ListItemButton key={item.key} selected={isSelected} sx={buttonStyles} onClick={() => onNavigate(item)}>
            {item.icon && <ListItemIcon sx={iconStyles}>{item.icon}</ListItemIcon>}
            {label}
          </ListItemButton>
        );
      })}
    </>
  );
};

export default MenuItems;
