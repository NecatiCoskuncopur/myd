'use client';

import styled from '@emotion/styled';
import { Box, Grid } from '@mui/material';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Wrapper>
      <Content>
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
    background: rgba(0, 0, 0, 0.5);
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  min-width: 200px;
`;
