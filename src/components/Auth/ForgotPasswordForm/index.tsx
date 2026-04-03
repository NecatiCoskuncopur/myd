'use client';

import { useState, useTransition } from 'react';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import forgotPassword from '@/app/actions/auth/forgotPassword';
import { authMessages, generalMessages } from '@/constants';
import ForgotPasswordSuccess from './ForgotPasswordSuccess';
import FormItems from './FormItems';

const ForgotPasswordForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [captchaKey, setCaptchaKey] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors },
  } = useForm<AuthTypes.IForgotPasswordPayload>({
    defaultValues: {
      email: '',
      recaptchaToken: '',
    },
  });

  const onSubmit = (values: AuthTypes.IForgotPasswordPayload) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await forgotPassword(values);

        if (response.status === 'ERROR') {
          resetField('recaptchaToken');
          setCaptchaKey(prev => prev + 1);
          setErrorMessage(response.message ?? authMessages.FORGOTPASSWORD.ERROR);
          return;
        }

        setSuccess(true);
      } catch {
        setErrorMessage(generalMessages.UNEXPECTED_ERROR);
      }
    });
  };

  if (success) {
    return (
      <>
        <ForgotPasswordSuccess />
      </>
    );
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Parolamı Unuttum
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Typography variant="body2" gutterBottom marginBottom={4}>
        Parolanı hatırladın mı? <Link href="/kullanici/giris">Giriş Yap</Link>
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems errors={errors} control={control} setValue={setValue} captchaKey={captchaKey} />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          startIcon={pending ? <CircularProgress /> : <PlayArrowIcon />}
          disabled={pending}
        >
          {pending ? 'Gönderiliyor...' : 'Sıfırlama Linkini Gönder'}
        </Button>
      </Box>
    </>
  );
};

export default ForgotPasswordForm;
