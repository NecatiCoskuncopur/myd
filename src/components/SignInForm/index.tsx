'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import signIn from '@/app/actions/auth/signIn';
import { authMessages, generalMessages } from '@/constants';
import FormItems from './FormItems';

const SignInForm = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const [pending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<AuthTypes.ISignInPayload>({
    defaultValues: {
      email: '',
      password: '',
      recaptchaToken: '',
    },
  });

  const onSubmit = (values: AuthTypes.ISignInPayload) => {
    startTransition(async () => {
      try {
        const response = await signIn(values);

        if (response.status === 'ERROR') {
          resetField('recaptchaToken');
          resetField('password');
          setCaptchaKey(prev => prev + 1);
          setErrorMessage(response.message ?? authMessages.SIGNIN.ERROR);
          return;
        }

        router.refresh();
        router.replace('/panel');
      } catch {
        setErrorMessage(generalMessages.UNEXPECTED_ERROR);
      }
    });
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
        <FormItems errors={errors} control={control} setValue={setValue} captchaKey={captchaKey} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          startIcon={pending && <CircularProgress size={20} />}
          disabled={pending}
        >
          {pending ? '' : 'Giriş Yap'}
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
