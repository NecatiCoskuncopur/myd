'use client';

import { Divider, Grid, useMediaQuery, useTheme } from '@mui/material';

import ChangePasswordForm from './ChangePasswordForm';
import EditUserForm from './EditUserForm';

const Account = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid
      container
      spacing={3}
      sx={{
        alignItems: 'stretch',
        minHeight: { xs: '100vh', sm: 'calc(100vh - 32px)', md: 'calc(100vh - 48px)' },
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: '12px',
        backgroundColor: theme.palette.dashboard.sidebar,
        color: theme.palette.dashboard.textSidebar,
      }}
    >
      <Grid size={{ xs: 12, md: 7.5 }}>
        <EditUserForm />
      </Grid>

      <Divider
        orientation={isMobile ? 'horizontal' : 'vertical'}
        flexItem
        sx={{
          borderColor: theme.palette.divider,
          my: 1,
        }}
      />

      <Grid size={{ xs: 12, md: 4 }}>
        <ChangePasswordForm />
      </Grid>
    </Grid>
  );
};

export default Account;
