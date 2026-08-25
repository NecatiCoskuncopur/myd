'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import signIn from '@/app/actions/auth/signIn';
import { authMessages, generalMessages } from '@/constants';

import FormItems from './FormItems';

const { SIGNIN } = authMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const SignInForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    control,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<AuthTypes.ISignInPayload>({
    defaultValues: {
      email: '',
      password: '',
      recaptchaToken: '',
    },
  });

  const resetCaptcha = () => {
    resetField('recaptchaToken');
    setCaptchaKey(prev => prev + 1);
  };

  const onSubmit = async (values: AuthTypes.ISignInPayload) => {
    setErrorMessage(null);

    try {
      const response = await signIn(values);

      if (response.status === 'ERROR') {
        resetField('password');
        resetCaptcha();

        setErrorMessage(response.message ?? SIGNIN.ERROR);

        return;
      }

      router.replace('/panel');
    } catch {
      resetField('password');
      resetCaptcha();
      setErrorMessage(UNEXPECTED_ERROR);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: '500' }}>
        Giriş Yap
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems errors={errors} control={control} captchaKey={captchaKey} />
        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={isSubmitting} loading={isSubmitting}>
          Giriş Yap
        </Button>
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: 14 }}>
          <Link
            href="/kullanici/kayit"
            sx={{
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'text.secondary', textDecoration: 'underline' },
            }}
          >
            Kayıt Ol
          </Link>

          <Box sx={{ color: 'text.disabled', userSelect: 'none' }}>•</Box>

          <Link
            href="/kullanici/parolami-unuttum"
            sx={{
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'text.secondary', textDecoration: 'underline' },
            }}
          >
            Parolamı Unuttum
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default SignInForm;
