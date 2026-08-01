'use client';

import React, { useState, useTransition } from 'react';

import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import signUp from '@/app/actions/auth/signUp';
import { authMessages, generalMessages } from '@/constants';
import FormItems from './FormItems';
import SignUpSuccess from './SignUpSuccess';

const SignUpForm = () => {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // const [captchaKey, setCaptchaKey] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<AuthTypes.ISignUpPayload>({
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
      // recaptchaToken: '',
    },
  });

  const onSubmit = (values: AuthTypes.ISignUpPayload) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await signUp(values);

        if (response.status === 'OK') {
          setSuccess(true);
          return;
        }

        resetField('password');
        setErrorMessage(response.message ?? authMessages.SIGNUP.ERROR);
      } catch {
        resetField('password');
        setErrorMessage(generalMessages.UNEXPECTED_ERROR);
      }
    });
  };

  if (success) {
    return <SignUpSuccess />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: '500' }}>
        Kayıt Ol
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box>
        <FormItems errors={errors} control={control} setValue={setValue} />
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 4 }}
          startIcon={pending ? <CircularProgress size={20} color="inherit" /> : undefined}
          disabled={pending}
        >
          {pending ? '' : 'Kayıt Ol'}
        </Button>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
          <Link
            href="/kullanici/giris"
            sx={{
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'text.secondary', textDecoration: 'underline' },
            }}
          >
            Giriş Yap
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default SignUpForm;
