'use client';

import { useState, useTransition } from 'react';
import { useParams } from 'next/navigation';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import resetPassword from '@/app/actions/auth/resetPassword';
import { messages } from '@/constants';
import FormItems from './FormItems';
import ResetPasswordSuccess from './ResetPasswordSuccess';

const { AUTH, GENERAL, PASSWORD } = messages;

const ResetPasswordForm = () => {
  const { secret } = useParams<{ secret: string }>();
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IResetPasswordForm>({
    defaultValues: {
      newPassword: '',
      newPasswordRepeat: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = (values: IResetPasswordForm) => {
    if (values.newPassword !== values.newPasswordRepeat) {
      setErrorMessage(PASSWORD.DO_NOT_MATCH);
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await resetPassword({
          token: secret,
          newPassword: values.newPassword,
        });

        if (response.status === 'ERROR') {
          if (response.message === AUTH.INVALID_TOKEN) {
            setErrorMessage(AUTH.INVALID_TOKEN);
          } else {
            setErrorMessage(response.message ?? AUTH.RESET_PASSWORD_ERROR);
          }
          return;
        }

        setSuccess(true);
      } catch {
        setErrorMessage(GENERAL.UNEXPECTED_ERROR);
      }
    });
  };

  if (success) {
    return <ResetPasswordSuccess />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>
        Yeni Parola Belirle
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Eski parolanı hatırladın mı? <Link href="/kullanici/giris">Giriş Yap</Link>
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems errors={errors} control={control} newPassword={newPassword} />
        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} startIcon={<PlayArrowIcon />} disabled={pending}>
          Parolayı Ayarla
        </Button>
      </Box>
    </>
  );
};

export default ResetPasswordForm;
