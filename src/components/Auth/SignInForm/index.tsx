'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
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
        <FormItems errors={errors} control={control} setValue={setValue} captchaKey={captchaKey} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{ mt: 3 }}
          startIcon={pending ? <CircularProgress /> : <LoginOutlinedIcon />}
          disabled={pending}
        >
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
