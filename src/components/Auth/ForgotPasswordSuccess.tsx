'use client';

import Link from 'next/link';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Stack, Typography } from '@mui/material';

import { company } from '@/constants';

const ForgotPasswordSuccess = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <InfoOutlinedIcon color="info" sx={{ fontSize: 64, mb: 2 }} />

        <Typography variant="h5" gutterBottom>
          İsteğiniz Alındı
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Girdiğiniz mail adresine kayıtlı bir hesap mevcut ise parola sıfırlama yönergeleri gönderilecektir. Eğer birkaç dakika içerisinde mail ulaşmadıysa
          hızlıca yardım alabilmeniz için aşağı butonlar bıraktık.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Button component={Link} href="/kullanici/giris" variant="contained">
            Geri Dön
          </Button>

          <Button href={company.phoneLink} startIcon={<PhoneOutlinedIcon />}>
            Bizi Arayın
          </Button>

          <Button href={company.emailLink} startIcon={<MailOutlinedIcon />}>
            Mail Gönderin
          </Button>

          <Button href={company.whatsappLink} startIcon={<WhatsAppIcon />}>
            WhatsApp
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ForgotPasswordSuccess;
