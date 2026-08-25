'use client';

import { Fragment } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography, useTheme } from '@mui/material';

import { UserTypes } from '@/types/user';

type MenuItemsProps = {
  items: UserTypes.ISidebarItem[];
  isExpanded: boolean;
  openKeys: string[];
  pathname: string;
  onToggle: (key: string) => void;
  onNavigate: (item: UserTypes.ISidebarItem) => void;
  depth?: number;
};

const MenuItems = ({ items, isExpanded, openKeys, pathname, onToggle, onNavigate, depth = 0 }: MenuItemsProps) => {
  const theme = useTheme();

  const transition = theme.transitions.create(['margin', 'padding', 'opacity'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.enteringScreen,
  });

  return (
    <>
      {items.map(item => {
        const hasChildren = Boolean(item.children?.length);
        const isOpen = openKeys.includes(item.key);
        const isSelected = item.path === pathname;
        const showTooltip = !isExpanded && depth === 0;

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
            sx={{
              my: 0,
              whiteSpace: 'nowrap',
              opacity: isExpanded ? 1 : 0,
              transition,
            }}
            primary={
              <Typography
                sx={{
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </Typography>
            }
          />
        );

        if (hasChildren) {
          const button = (
            <ListItemButton onClick={() => onToggle(item.key)} aria-expanded={isOpen} sx={buttonStyles}>
              {item.icon && <ListItemIcon sx={iconStyles}>{item.icon}</ListItemIcon>}

              {label}

              {isExpanded && (isOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          );

          return (
            <Fragment key={item.key}>
              {showTooltip ? (
                <Tooltip title={item.label} placement="right" arrow>
                  <Box component="span" sx={{ display: 'block' }}>
                    {button}
                  </Box>
                </Tooltip>
              ) : (
                button
              )}

              <Collapse in={isOpen && isExpanded} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pt: 0.5 }}>
                  <MenuItems
                    items={item.children!}
                    isExpanded={isExpanded}
                    openKeys={openKeys}
                    pathname={pathname}
                    onToggle={onToggle}
                    onNavigate={onNavigate}
                    depth={depth + 1}
                  />
                </List>
              </Collapse>
            </Fragment>
          );
        }

        const button = (
          <ListItemButton selected={isSelected} onClick={() => onNavigate(item)} sx={buttonStyles}>
            {item.icon && <ListItemIcon sx={iconStyles}>{item.icon}</ListItemIcon>}

            {label}
          </ListItemButton>
        );

        return showTooltip ? (
          <Tooltip key={item.key} title={item.label} placement="right" arrow>
            <Box component="span" sx={{ display: 'block' }}>
              {button}
            </Box>
          </Tooltip>
        ) : (
          <Fragment key={item.key}>{button}</Fragment>
        );
      })}
    </>
  );
};

export default MenuItems;
