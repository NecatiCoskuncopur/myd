'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Alert, Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import signIn from '@/app/actions/auth/signIn';
import { messages } from '@/constants';
import HCaptchaField from './HCaptcha';

const SignInForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<ISignInPayload>({
    defaultValues: {
      email: '',
      password: '',
      recaptchaToken: '',
    },
  });

  const onSubmit = (values: ISignInPayload) => {
    startTransition(async () => {
      const response = await signIn(values);

      if (response.status === 'ERROR') {
        resetField('recaptchaToken');
        setCaptchaKey(prev => prev + 1);
        setErrorMessage(response.message ?? 'Giriş başarısız');
        return;
      }

      router.push('/panel');
    });
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Giriş Yap
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Typography variant="body2" mb={3}>
        Henüz kayıt olmadın mı? <Link href="/kullanici/kayit">Kayıt Ol</Link>
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="email"
          control={control}
          rules={{
            required: messages.EMAIL.REQUIRED,
            pattern: {
              value: /^\S+@\S+$/i,
              message: messages.EMAIL.INVALID,
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
                endAdornment: <InputAdornment position="end" sx={{ width: 40 }} />,
              }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: messages.PASSWORD.REQUIRED,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Parola"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
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
                    <IconButton
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                    >
                      {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="recaptchaToken"
          control={control}
          rules={{ required: messages.CAPTCHA.REQUIRED }}
          render={() => (
            <Box mt={2}>
              <HCaptchaField
                key={captchaKey}
                onVerify={token =>
                  setValue('recaptchaToken', token, {
                    shouldValidate: true,
                  })
                }
                onExpire={() =>
                  setValue('recaptchaToken', '', {
                    shouldValidate: true,
                  })
                }
              />
              {errors.recaptchaToken && (
                <Typography variant="caption" color="error" display="block" mt={1}>
                  {errors.recaptchaToken.message}
                </Typography>
              )}
            </Box>
          )}
        />

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} startIcon={<LoginOutlinedIcon />} disabled={pending}>
          Giriş Yap
        </Button>

        <Box mt={2}>
          <Link href="/kullanici/parolami-unuttum">Parolamı Unuttum</Link>
        </Box>
      </Box>
    </>
  );
};

export default SignInForm;
