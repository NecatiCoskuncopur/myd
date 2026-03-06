'use client';

import React, { useState, useTransition } from 'react';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import signUp from '@/app/actions/auth/signUp';
import { messages } from '@/constants';
import FormItems from './FormItems';
import SignUpSuccess from './SignUpSuccess';

const { AUTH, GENERAL } = messages;

const SignUpForm = () => {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await signUp(values);

        if (response.status === 'ERROR') {
          resetField('recaptchaToken');
          setCaptchaKey(prev => prev + 1);
          setErrorMessage(response.message ?? AUTH.SIGNUP_ERROR);
          return;
        }

        setSuccess(true);
      } catch {
        setErrorMessage(GENERAL.UNEXPECTED_ERROR);
      }
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

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" mb={3}>
        Zaten kayıt oldunuz mu? <Link href="/kullanici/giris">Giriş Yap</Link>
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems errors={errors} control={control} setValue={setValue} captchaKey={captchaKey} />
        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 4 }} startIcon={<PlayArrowIcon />} disabled={pending}>
          Kayıt Ol
        </Button>
      </Box>
    </>
  );
};

export default SignUpForm;
