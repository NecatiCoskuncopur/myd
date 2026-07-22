'use client';

import * as React from 'react';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, useTheme } from '@mui/material';
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
          mb: depth === 0 ? 1 : 0.5,
          transition,
        };

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

        // Alt menüsü (children) olan elemanlar
        if (item.children) {
          const parentButton = (
            <ListItemButton onClick={() => onToggle(item.key)} sx={buttonStyles}>
              {item.icon && <ListItemIcon sx={iconStyles}>{item.icon}</ListItemIcon>}
              {label}
              {isExpanded && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          );

          return (
            <React.Fragment key={item.key}>
              {!isExpanded && depth === 0 ? (
                <Tooltip title={item.label} placement="right" arrow>
                  <Box component="span" sx={{ display: 'block' }}>
                    {parentButton}
                  </Box>
                </Tooltip>
              ) : (
                parentButton
              )}

              <Collapse in={isOpen && isExpanded} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pt: 0.5 }}>
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

        const itemButton = (
          <ListItemButton selected={isSelected} sx={buttonStyles} onClick={() => onNavigate(item)}>
            {item.icon && <ListItemIcon sx={iconStyles}>{item.icon}</ListItemIcon>}
            {label}
          </ListItemButton>
        );

        if (!isExpanded && depth === 0) {
          return (
            <Tooltip key={item.key} title={item.label} placement="right" arrow>
              <Box component="span" sx={{ display: 'block' }}>
                {itemButton}
              </Box>
            </Tooltip>
          );
        }

        return <React.Fragment key={item.key}>{itemButton}</React.Fragment>;
      })}
    </>
  );
};

export default MenuItems;
