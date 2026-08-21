'use client';

import { useEffect, useTransition } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import editUser from '@/app/actions/user/editUser';
import getUser from '@/app/actions/user/getUser';
import { StyledButton } from '@/components';
import { generalMessages, userMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { UserTypes } from '@/types/user';

import FormItems from './FormItems';

const { EMAIL, EDITUSER, NOT_FOUND } = userMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const EditUserForm = () => {
  const [pending, startTransition] = useTransition();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserTypes.IEditUserPayload>({
    defaultValues: {
      firstName: '',
      lastName: '',
      nickname: '',
      company: '',
      taxId: '',
      taxOffice: '',
      phone: '',
      email: '',
      address: {
        line1: '',
        line2: '',
        district: '',
        city: '',
        postalCode: '',
      },
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUser();
      if (result.status === 'OK' && result.data) {
        reset(result.data);
      } else {
        showSnackbar(result.message || NOT_FOUND, 'error');
      }
    };
    fetchUser();
  }, [reset]);

  const onSubmit = (data: UserTypes.IEditUserPayload) => {
    startTransition(async () => {
      const result = await editUser(data);

      if (result.status === 'ERROR') {
        if (result.message === EMAIL.EXIST) {
          setError('email', {
            type: 'manual',
            message: EMAIL.EXIST,
          });
          return;
        }

        showSnackbar(result.message || UNEXPECTED_ERROR, 'error');
        return;
      }

      showSnackbar(result.message || EDITUSER.SUCCESS, 'success');
    });
  };

  return (
    <Grid container sx={{ justifyContent: 'center' }}>
      <Box>
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 500 }}>
          Hesabımı Düzenle
        </Typography>

        <Box component="form" noValidate>
          <FormItems errors={errors} control={control} />
          <StyledButton
            type="button"
            onClick={handleSubmit(onSubmit)}
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
    </Grid>
  );
};

export default EditUserForm;
