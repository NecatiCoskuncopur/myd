'use client';

import React, { useState } from 'react';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import forgotPassword from '@/app/actions/auth/forgotPassword';
import { authMessages, generalMessages } from '@/constants';

import ForgotPasswordSuccess from './ForgotPasswordSuccess';
import FormItems from './FormItems';

const ForgotPasswordForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AuthTypes.IForgotPasswordPayload>({
    defaultValues: {
      email: '',
      recaptchaToken: '',
    },
  });

  const resetCaptcha = () => {
    setValue('recaptchaToken', '');
    setCaptchaKey(prev => prev + 1);
  };

  const onSubmit = async (values: AuthTypes.IForgotPasswordPayload) => {
    setErrorMessage(null);

    try {
      const response = await forgotPassword(values);

      if (response.status === 'ERROR') {
        resetCaptcha();
        setErrorMessage(response.message ?? authMessages.FORGOTPASSWORD.ERROR);
        return;
      }

      setIsSuccess(true);
    } catch {
      resetCaptcha();
      setErrorMessage(generalMessages.UNEXPECTED_ERROR);
    }
  };

  if (isSuccess) {
    return <ForgotPasswordSuccess />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: '500' }}>
        Parolamı Unuttum
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems errors={errors} control={control} captchaKey={captchaKey} />

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={isSubmitting} loading={isSubmitting}>
          Sıfırlama Linkini Gönder
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

export default ForgotPasswordForm;
