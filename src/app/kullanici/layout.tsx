'use client';

import { usePathname } from 'next/navigation';

import styled from '@emotion/styled';
import { Box, Grid } from '@mui/material';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const isSignUpPage = pathname === '/kullanici/kayit';
  return (
    <Wrapper>
      <Content
        sx={{
          maxWidth: { xs: '90%', md: '50%', lg: isSignUpPage ? '35%' : '25%' },
          width: '100%',
        }}
      >
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
        {children}
      </Content>
    </Wrapper>
  );
};

export default AuthLayout;

const Wrapper = styled(Grid)`
  position: relative;
  min-height: 100vh;
  width: 100%;

  background-image: url('/images/authSide.jpg');
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
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 36px rgba(10, 5, 5, 0.3);
  }
`;
