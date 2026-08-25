'use client';

import React, { useState } from 'react';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import signUp from '@/app/actions/auth/signUp';
import { authMessages, generalMessages } from '@/constants';

import FormItems from './FormItems';
import SignUpSuccess from './SignUpSuccess';

const { SIGNUP } = authMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const SignUpForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    control,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<AuthTypes.ISignUpPayload>({
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      taxId: '',
      taxOffice: '',
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

  const resetCaptcha = () => {
    resetField('recaptchaToken');
    setCaptchaKey(prev => prev + 1);
  };

  const onSubmit = async (values: AuthTypes.ISignUpPayload) => {
    setErrorMessage(null);

    try {
      const response = await signUp(values);

      if (response.status === 'ERROR') {
        resetField('password');
        resetCaptcha();

        setErrorMessage(response.message ?? SIGNUP.ERROR);

        return;
      }

      setIsSuccess(true);
    } catch {
      resetField('password');
      resetCaptcha();
      setErrorMessage(UNEXPECTED_ERROR);
    }
  };

  if (isSuccess) {
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
        <FormItems errors={errors} control={control} captchaKey={captchaKey} />
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 4 }}
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          Kayıt Ol
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
