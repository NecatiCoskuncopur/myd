'use client';

import { useState } from 'react';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityIcon from '@mui/icons-material/Security';
import { Grid, IconButton, List, ListItemButton, ListItemText, useTheme } from '@mui/material';

import ChangePasswordForm from './ChangePassword';
import EditUser from './EditUser';

const Account = () => {
  const [active, setActive] = useState<number>(0);
  const theme = useTheme();

  const menuItems = [
    {
      name: 'Kişisel Bilgiler',
      icon: <PersonOutlineIcon />,
    },
    {
      name: 'Güvenlik',
      icon: <SecurityIcon />,
    },
  ];

  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid
        size={{ xs: 12, md: 3 }}
        sx={{
          borderRadius: '12px',
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
          alignSelf: 'flex-start',
        }}
      >
        <List
          sx={{
            p: '8px 28px',
          }}
        >
          {menuItems.map((item, index) => (
            <ListItemButton
              key={item.name}
              onClick={() => setActive(index)}
              disableRipple
              disableTouchRipple
              sx={{
                p: 0,
                color: active === index ? '#6c5ce7' : 'inherit',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:not(:last-child)': {
                  borderBottom: `1px solid ${theme.palette.dashboard.border}`,
                },
              }}
            >
              <IconButton
                sx={{
                  color: active === index ? '#6c5ce7' : 'inherit',
                  '& svg': {
                    fontSize: 18,
                  },
                }}
              >
                {item.icon}
              </IconButton>
              <ListItemText
                primary={item.name}
                sx={{
                  p: '16px 0',
                  m: 0,
                }}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Grid>
      <Grid
        size={{ xs: 12, md: 9 }}
        sx={{
          p: 5,
          borderRadius: '12px',
          backgroundColor: theme.palette.dashboard.sidebar,
          color: theme.palette.dashboard.textSidebar,
        }}
      >
        {active === 0 && <EditUser />}
        {active === 1 && <ChangePasswordForm />}
      </Grid>
    </Grid>
  );
};

export default Account;
