'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

import BankOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EnvironmentOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Alert, Box, Button, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import signUp from '@/app/actions/auth/signUp';
import { messages } from '@/constants';
import HCaptchaField from './HCaptcha';
import SignUpSuccess from './SignUpSuccess';

const { ADDRESS, CAPTCHA, CITY, COMPANY, DISTRICT, EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE, POSTALCODE } = messages;

const SignUpForm = () => {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<ISignUpPayload>({
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      email: '',
      password: '',
      address: {
        line1: '',
        line2: '',
        district: '',
        city: '',
        postalCode: '',
      },
      recaptchaToken: '',
    },
  });

  const onSubmit = (values: ISignUpPayload) => {
    setEmailError(null);
    setErrorMessage(null);

    startTransition(async () => {
      const response = await signUp(values);

      if (response.status === 'ERROR') {
        const msg = response.message ?? '';

        if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('eposta')) {
          setEmailError('Bu E-Posta adresi zaten kayıtlı!');
        } else {
          setErrorMessage(msg || 'Kayıt sırasında hata oluştu');
        }
        resetField('recaptchaToken');
        setCaptchaKey(prev => prev + 1);
        return;
      }
      setSuccess(true);
    });
  };

  if (success) {
    return <SignUpSuccess />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Kayıt Ol
      </Typography>

      {(errorMessage || emailError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {emailError ?? errorMessage}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" mb={3}>
        Zaten kayıt oldunuz mu? <Link href="/kullanici/giris">Giriş Yap</Link>
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: FIRSTNAME.REQUIRED,
                minLength: { value: 2, message: FIRSTNAME.MIN },
                maxLength: { value: 75, message: FIRSTNAME.MAX },
              }}
              render={({ field }) => <TextField {...field} label="Ad" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: LASTNAME.REQUIRED,
                minLength: { value: 2, message: LASTNAME.MIN },
                maxLength: { value: 75, message: LASTNAME.MAX },
              }}
              render={({ field }) => <TextField {...field} label="Soyad" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="company"
              rules={{
                validate: value => {
                  if (!value) return true;
                  if (value.length < 5) return COMPANY.MIN;
                  if (value.length > 75) return COMPANY.MAX;
                  return true;
                },
              }}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Firma İsmi"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <BankOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: PHONE.REQUIRED,
                validate: value => value.length === 10 || PHONE.LENGTH,
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telefon No"
                  fullWidth
                  placeholder="5333022159"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <PhoneOutlinedIcon />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          +90
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: EMAIL.REQUIRED,
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: EMAIL.INVALID,
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-Posta"
                  fullWidth
                  error={!!errors.email || !!emailError}
                  helperText={errors.email?.message ?? emailError}
                  onChange={e => {
                    setEmailError(null);
                    field.onChange(e);
                  }}
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
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: PASSWORD.REQUIRED,
                minLength: { value: 8, message: PASSWORD.MIN },
                maxLength: { value: 255, message: PASSWORD.MAX },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Parola"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <LockOutlinedIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(p => !p)}>
                          {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="address.line1"
              control={control}
              rules={{
                required: ADDRESS.REQUIRED,
                minLength: { value: 5, message: ADDRESS.MIN },
                maxLength: { value: 255, message: ADDRESS.MAX },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Adres"
                  fullWidth
                  error={!!errors.address?.line1}
                  helperText={errors.address?.line1?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        <EnvironmentOutlinedIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller name="address.line2" control={control} render={({ field }) => <TextField {...field} label="Adres Satırı 2" fullWidth />} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="address.district"
              control={control}
              rules={{
                required: DISTRICT.REQUIRED,
                minLength: { value: 2, message: DISTRICT.MIN },
                maxLength: { value: 25, message: DISTRICT.MAX },
              }}
              render={({ field }) => <TextField {...field} label="İlçe" fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="address.city"
              control={control}
              rules={{
                required: CITY.REQUIRED,
                minLength: { value: 2, message: CITY.MIN },
                maxLength: { value: 35, message: CITY.MAX },
              }}
              render={({ field }) => <TextField {...field} label="İl" fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="address.postalCode"
              control={control}
              rules={{
                required: POSTALCODE.REQUIRED,
                validate: value => value.length === 5 || POSTALCODE.LENGTH,
              }}
              render={({ field }) => <TextField {...field} label="Posta Kodu" fullWidth />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              key={captchaKey}
              name="recaptchaToken"
              control={control}
              rules={{ required: CAPTCHA.REQUIRED }}
              render={() => <HCaptchaField onVerify={token => setValue('recaptchaToken', token)} onExpire={() => setValue('recaptchaToken', '')} />}
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 4 }} startIcon={<PlayArrowIcon />} disabled={pending}>
          Kayıt Ol
        </Button>
      </Box>
    </>
  );
};

export default SignUpForm;
