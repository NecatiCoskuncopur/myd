'use client';

import { useState } from 'react';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import resetPassword from '@/app/actions/auth/resetPassword';
import { authMessages, generalMessages } from '@/constants';

import FormItems from './FormItems';
import ResetPasswordSuccess from './ResetPasswordSuccess';

const { RESETPASSWORD } = authMessages;

type ResetPasswordFormProps = {
  secret: string;
};

const ResetPasswordForm = ({ secret }: ResetPasswordFormProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthTypes.IResetPasswordForm>({
    defaultValues: {
      newPassword: '',
      newPasswordRepeat: '',
    },
  });

  const onSubmit = async (values: AuthTypes.IResetPasswordForm) => {
    setErrorMessage(null);

    try {
      const response = await resetPassword({
        token: secret,
        newPassword: values.newPassword,
      });

      if (response.status === 'ERROR') {
        setErrorMessage(response.message ?? RESETPASSWORD.ERROR);
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage(generalMessages.UNEXPECTED_ERROR);
    }
  };

  if (isSuccess) {
    return <ResetPasswordSuccess />;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: '500' }}>
        Yeni Parola Belirle
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormItems errors={errors} control={control} />
        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={isSubmitting} loading={isSubmitting}>
          Parolayı Ayarla
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

export default ResetPasswordForm;
