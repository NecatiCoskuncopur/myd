'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Alert, Box, Grid, Snackbar, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import editUser from '@/app/actions/user/editUser';
import getUser from '@/app/actions/user/getUser';
import { StyledButton } from '@/components';
import { generalMessages, userMessages } from '@/constants';
import FormItems from './FormItems';

const { EMAIL, EDITUSER, NOT_FOUND } = userMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const EditUserForm = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserTypes.IEditUserPayload>();

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        reset(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.message || NOT_FOUND,
          severity: 'error',
        });
      }
    };
    fetchUser();
  }, [reset]);

  const onSubmit = (data: UserTypes.IEditUserPayload) => {
    startTransition(async () => {
      try {
        const result = await editUser(data);
        if (result.status === 'ERROR') {
          const message = result.message ?? '';
          if (message.toLowerCase().includes('email')) {
            setError('email', { type: 'manual', message: EMAIL.EXIST });
            return;
          }
          setSnackbar({ open: true, message, severity: 'error' });
          return;
        }
        setSnackbar({ open: true, message: EDITUSER.SUCCESS, severity: 'success' });
        router.refresh();
      } catch (error: unknown) {
        const err = error as Error;
        setSnackbar({
          open: true,
          message: err.message || UNEXPECTED_ERROR,
          severity: 'error',
        });
      }
    });
  };

  return (
    <Grid container justifyContent="center">
      <Box>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
          Hesabımı Düzenle
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormItems errors={errors} register={register} pending={pending} />
          <StyledButton
            type="submit"
            variant="contained"
            sx={{
              mt: 6,
              float: 'right',
            }}
            loading={pending}
          >
            Bilgileri Kaydet
          </StyledButton>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default EditUserForm;
