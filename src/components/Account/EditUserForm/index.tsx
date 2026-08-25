'use client';

import { Box, Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import editUser from '@/app/actions/user/editUser';
import { StyledButton } from '@/components';
import { generalMessages, userMessages } from '@/constants';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { UserTypes } from '@/types/user';

import FormItems from './FormItems';

const { EMAIL, EDITUSER } = userMessages;
const { UNEXPECTED_ERROR } = generalMessages;

type EditUserFormProps = {
  user: UserTypes.UserDto | undefined;
};

const EditUserForm = ({ user }: EditUserFormProps) => {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserTypes.IEditUserPayload>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      nickname: user?.nickname ?? '',
      company: user?.company ?? '',
      taxId: user?.taxId ?? '',
      taxOffice: user?.taxOffice ?? '',
      phone: user?.phone ?? '',
      email: user?.email ?? '',
      address: {
        line1: user?.address?.line1 ?? '',
        line2: user?.address?.line2 ?? '',
        district: user?.address?.district ?? '',
        city: user?.address?.city ?? '',
        postalCode: user?.address?.postalCode ?? '',
      },
    },
  });

  const onSubmit = async (data: UserTypes.IEditUserPayload) => {
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
            loading={isSubmitting}
          >
            Bilgileri Kaydet
          </StyledButton>
        </Box>
      </Box>
    </Grid>
  );
};

export default EditUserForm;
