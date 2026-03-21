'use client';

import { useEffect, useState, useTransition } from 'react';

import { Alert, Box, Button, Grid, Snackbar, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import editUser from '@/app/actions/user/editUser';
import getUser from '@/app/actions/user/getUser';
import { messages } from '@/constants';
import FormItems from './FormItems';

const { GENERAL, USER } = messages;
const { EMAIL, SUCCESS } = USER;

const EditUser = () => {
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
  } = useForm<IEditUserPayload>();

  useEffect(() => {
    startTransition(async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        reset(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.message || USER.NOT_FOUND,
          severity: 'error',
        });
      }
    });
  }, [reset]);

  const onSubmit = (data: IEditUserPayload) => {
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
        setSnackbar({ open: true, message: SUCCESS, severity: 'success' });
      } catch (error: unknown) {
        const err = error as Error;
        setSnackbar({
          open: true,
          message: err.message || GENERAL.UNEXPECTED_ERROR,
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
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 6,
              p: '10px 22px',
              backgroundColor: '#5F4AFE',
              color: '#FFFFFF',
              float: 'right',
              '&:hover': {
                backgroundColor: '#4C3BCB',
              },
            }}
            loading={pending}
          >
            Bilgileri Kaydet
          </Button>
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

export default EditUser;
