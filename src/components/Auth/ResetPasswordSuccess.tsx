'use client';

import Link from 'next/link';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Button, Container, Typography } from '@mui/material';

const ResetPasswordSuccess = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <Box width="100%">
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />

          <Typography variant="h5" gutterBottom>
            Başarıyla Sıfırlandı
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Parolanız başarıyla güncellendi, giriş yapabilirsiniz
          </Typography>

          <Button component={Link} href="/kullanici/giris" variant="contained" size="large">
            Giriş Yap
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordSuccess;
