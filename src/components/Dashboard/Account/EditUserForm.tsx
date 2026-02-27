'use client';

import { useEffect, useState, useTransition } from 'react';

import BankOutlinedIcon from '@mui/icons-material/AccountBalance';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { Alert, Box, Button, Grid, InputAdornment, Snackbar, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import editUser from '@/app/actions/user/editUser';
import getUser from '@/app/actions/user/getUser';
import { messages } from '@/constants';

const { ADDRESS, CITY, COMPANY, DISTRICT, EDITUSER, EMAIL, FIRSTNAME, GENERAL, LASTNAME, PHONE, POSTALCODE } = messages;

const EditUserForm = () => {
  const [isPending, startTransition] = useTransition();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<IEditUserPayload>();

  useEffect(() => {
    startTransition(async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        reset(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.message || GENERAL.USER_NOT_FOUND,
          severity: 'error',
        });
      }
    });
  }, [reset]);

  const onSubmit = (data: IEditUserPayload) => {
    startTransition(async () => {
      try {
        const result = await editUser(data);
        if (result.status === 'ERROR') {
          const message = result.message ?? '';
          if (message.toLowerCase().includes('email')) {
            setError('email', { type: 'manual', message: EMAIL.EXIST });
            return;
          }
          setSnackbar({ open: true, message, severity: 'error' });
          return;
        }
        setSnackbar({ open: true, message: EDITUSER.SUCCESS, severity: 'success' });
      } catch (error: unknown) {
        const err = error as Error;
        setSnackbar({
          open: true,
          message: err.message || GENERAL.UNEXPECTED_ERROR,
          severity: 'error',
        });
      }
    });
  };

  return (
    <Grid container justifyContent="center">
      <Grid size={{ xs: 12, md: 10, lg: 8 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
            Hesabımı Düzenle
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Ad"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('firstName', {
                    required: FIRSTNAME.REQUIRED,
                    minLength: { value: 2, message: FIRSTNAME.MIN },
                    maxLength: { value: 75, message: FIRSTNAME.MAX },
                  })}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Soyad"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('lastName', {
                    required: LASTNAME.REQUIRED,
                    minLength: { value: 2, message: LASTNAME.MIN },
                    maxLength: { value: 75, message: LASTNAME.MAX },
                  })}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Firma İsmi"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('company', {
                    validate: value => {
                      if (!value) return true;
                      if (value.length < 5) return COMPANY.MIN;
                      if (value.length > 75) return COMPANY.MAX;
                      return true;
                    },
                  })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BankOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Telefon"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('phone', { required: PHONE.REQUIRED, validate: value => value.length === 10 || PHONE.LENGTH })}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ mr: 1 }} />
                        +90
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="E-Posta"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('email', {
                    required: EMAIL.REQUIRED,
                    pattern: { value: /^\S+@\S+$/i, message: EMAIL.INVALID },
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Adres Satırı 1"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('address.line1', {
                    required: ADDRESS.REQUIRED,
                    minLength: { value: 5, message: ADDRESS.MIN },
                    maxLength: { value: 255, message: ADDRESS.MAX },
                  })}
                  error={!!errors.address?.line1}
                  helperText={errors.address?.line1?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Adres Satırı 2"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('address.line2')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="İlçe"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('address.district', {
                    required: DISTRICT.REQUIRED,
                    minLength: { value: 2, message: DISTRICT.MIN },
                    maxLength: { value: 25, message: DISTRICT.MAX },
                  })}
                  error={!!errors.address?.district}
                  helperText={errors.address?.district?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="İl"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('address.city', {
                    required: CITY.REQUIRED,
                    minLength: { value: 2, message: CITY.MIN },
                    maxLength: { value: 35, message: CITY.MAX },
                  })}
                  error={!!errors.address?.city}
                  helperText={errors.address?.city?.message}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Posta Kodu"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={isPending}
                  {...register('address.postalCode', { required: POSTALCODE.REQUIRED, validate: value => value.length === 5 || POSTALCODE.LENGTH })}
                  error={!!errors.address?.postalCode}
                  helperText={errors.address?.postalCode?.message}
                />
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 6, py: 1.8 }} loading={isPending}>
              Bilgileri Kaydet
            </Button>
          </Box>
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
};

export default EditUserForm;
