'use client';

import { useState, useTransition } from 'react';

import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, Button, InputAdornment, Link, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import forgotPassword from '@/app/actions/auth/forgotPassword';
import { messages } from '@/constants';
import ForgotPasswordSuccess from './ForgotPasswordSuccess';

const { AUTH, GENERAL, USER } = messages;

const ForgotPasswordForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordPayload>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (values: IForgotPasswordPayload) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await forgotPassword(values);

        if (response.status === 'ERROR') {
          setErrorMessage(response.message ?? AUTH.FORGOTPASSWORD_ERROR);
          return;
        }

        setSuccess(true);
      } catch {
        setErrorMessage(GENERAL.UNEXPECTED_ERROR);
      }
    });
  };

  if (success) {
    return (
      <>
        <ForgotPasswordSuccess />
      </>
    );
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Parolamı Unuttum
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Typography variant="body2" gutterBottom marginBottom={4}>
        Parolanı hatırladın mı? <Link href="/kullanici/giris">Giriş Yap</Link>
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="email"
          control={control}
          rules={{
            required: USER.EMAIL.REQUIRED,
            pattern: {
              value: /^\S+@\S+$/i,
              message: USER.EMAIL.INVALID,
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="E-Posta"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <MailOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} startIcon={<PlayArrowIcon />} disabled={pending}>
          Sıfırlama Linkini Gönder
        </Button>
      </Box>
    </>
  );
};

export default ForgotPasswordForm;
