'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

import styled from '@emotion/styled';
import { Box, CssBaseline, Grid, ThemeProvider, Typography } from '@mui/material';

import theme from '@/theme';

type AuthLayoutProps = {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();

  const isSignUpPage = pathname === '/kullanici/kayit';

  return (
    <ThemeProvider theme={theme('light')}>
      <CssBaseline />
      <Wrapper>
        <Content
          sx={{
            maxWidth: { xs: '90%', md: '50%', lg: isSignUpPage ? '35%' : '25%' },
            width: '100%',
          }}
        >
          <Grid size={{ xs: 10, md: 8 }} sx={{ display: 'flex', justifyContent: 'center' }}>
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
          {children}
        </Content>
        <Typography sx={{ position: 'absolute', left: '50%', translate: '-50%', bottom: '20px', color: '#94A3B8' }}>MYD Export © 2026 </Typography>
      </Wrapper>
    </ThemeProvider>
  );
};

export default AuthLayout;

const Wrapper = styled(Grid)`
  position: relative;
  min-height: 100vh;
  width: 100%;

  background-image: url('/images/authBg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
  }
`;

const Content = styled(Grid)`
  position: relative;
  z-index: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(10, 5, 5, 0.3);
`;
