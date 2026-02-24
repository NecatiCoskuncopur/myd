'use client';
import React from 'react';

import styled from '@emotion/styled';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Grid container minHeight="100vh">
      <Grid size={{ xs: 12, sm: 12, md: 7, lg: 4 }} display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={3}>
        <Grid size={{ xs: 10, md: 8 }} display="flex" justifyContent="center">
          <Box
            component="img"
            src="/images/logo.svg"
            alt="Logo"
            sx={{
              width: 150,
              objectFit: 'cover',
            }}
          />
        </Grid>
        <Grid container display="flex" alignItems="center" justifyContent="center" flexDirection="column">
          <Grid size={{ xs: 10, md: 8 }}>{children}</Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 0, sm: 0, md: 5, lg: 8 }}>
        <ImageWrapper />
      </Grid>
    </Grid>
  );
};

export default AuthLayout;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/images/authSide.jpg');
  background-size: cover;
`;
