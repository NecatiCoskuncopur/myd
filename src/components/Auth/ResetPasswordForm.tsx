'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Alert, Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import resetPassword from '@/app/actions/auth/resetPassword';
import { messages } from '@/constants';
import ResetPasswordSuccess from './ResetPasswordSuccess';

interface IFormValues {
  newPassword: string;
  newPasswordRepeat: string;
}

const ResetPasswordForm = () => {
  const { secret } = useParams<{ secret: string }>();
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormValues>({
    defaultValues: {
      newPassword: '',
      newPasswordRepeat: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = (values: IFormValues) => {
    if (values.newPassword !== values.newPasswordRepeat) {
      setErrorMessage('Yeni parolanızı iki kutucuğa da aynı şekilde yazmalısınız!');
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      const response = await resetPassword({
        token: secret,
        newPassword: values.newPassword,
      });

      if (response.status === 'ERROR') {
        setErrorMessage(response.message ?? 'Giriş başarısız');
        return;
      }
      setSuccess(true);
    });
  };

  if (success) {
    return <ResetPasswordSuccess />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Yeni Parola Belirle
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Eski parolanı hatırladın mı? <Link href="/kullanici/giris">Giriş Yap</Link>
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: messages.PASSWORD.REQUIRED,
            minLength: { value: 8, message: messages.PASSWORD.MIN },
            maxLength: { value: 255, message: messages.PASSWORD.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Yeni Parola"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              disabled={pending}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" size="small" onClick={() => setShowPassword(prev => !prev)}>
                      {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Controller
          name="newPasswordRepeat"
          control={control}
          rules={{
            required: messages.PASSWORD.REPEAT,
            validate: value => value === newPassword || 'Parolalar eşleşmiyor',
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Yeni Parola Tekrar"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={!!errors.newPasswordRepeat}
              helperText={errors.newPasswordRepeat?.message}
              disabled={pending}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" size="small" onClick={() => setShowPassword(prev => !prev)}>
                      {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} startIcon={<PlayArrowIcon />} disabled={pending}>
          Parolayı Ayarla
        </Button>
      </Box>
    </>
  );
};

export default ResetPasswordForm;
