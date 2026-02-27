'use client';

import { useState, useTransition } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Alert, Box, Button, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import changePassword from '@/app/actions/user/changePassword';
import { messages } from '@/constants';

const ChangePasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IChangePasswordFormUI>();

  const onSubmit = (values: IChangePasswordFormUI) => {
    if (values.newPassword !== values.newPasswordRepeat) {
      setSnackbar({ open: true, message: messages.PASSWORD.DO_NOT_MATCH, severity: 'error' });
      return;
    }

    startTransition(async () => {
      try {
        const response = await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        if (response.status === 'ERROR') {
          setSnackbar({
            open: true,
            message: response.message || 'Bir hata oluştu',
            severity: 'error',
          });
          return;
        }
        setSnackbar({ open: true, message: messages.PASSWORD.SUCCESS, severity: 'success' });
        reset();
      } catch (error: unknown) {
        const err = error as Error;
        setSnackbar({ open: true, message: err.message || messages.GENERAL.UNEXPECTED_ERROR, severity: 'error' });
      }
    });
  };

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 8 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Parola Değiştir
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Mevcut Parola"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            disabled={isPending}
            {...register('currentPassword', { required: 'Zorunlu alan' })}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Yeni Parola"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            disabled={isPending}
            {...register('newPassword', { required: 'Zorunlu alan', minLength: { value: 8, message: 'Min 8 karakter' } })}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Yeni Parola (Tekrar)"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            disabled={isPending}
            {...register('newPasswordRepeat', { required: 'Zorunlu alan' })}
            error={!!errors.newPasswordRepeat}
            helperText={errors.newPasswordRepeat?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }} loading={isPending}>
            Parolayı Güncelle
          </Button>
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default ChangePasswordForm;
