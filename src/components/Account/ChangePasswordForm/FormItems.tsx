import { Grid } from '@mui/material';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { userMessages } from '@/constants';
import { UserTypes } from '@/types/user';

import PasswordField from './PasswordField';

const { PASSWORD } = userMessages;

type FormItemsProps = {
  register: UseFormRegister<UserTypes.IChangePasswordFormUI>;
  errors: FieldErrors<UserTypes.IChangePasswordFormUI>;
  pending: boolean;
};

const FormItems = ({ register, errors, pending }: FormItemsProps) => {
  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <PasswordField
          label="Mevcut Parola"
          disabled={pending}
          {...register('currentPassword', {
            required: PASSWORD.REQUIRED,
            minLength: {
              value: 8,
              message: PASSWORD.MIN,
            },
            maxLength: {
              value: 255,
              message: PASSWORD.MAX,
            },
          })}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
        />
      </Grid>

      <Grid size={12}>
        <PasswordField
          label="Yeni Parola"
          disabled={pending}
          {...register('newPassword', {
            required: PASSWORD.REQUIRED,
            minLength: {
              value: 8,
              message: PASSWORD.MIN,
            },
            maxLength: {
              value: 255,
              message: PASSWORD.MAX,
            },
          })}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
        />
      </Grid>

      <Grid size={12}>
        <PasswordField
          label="Yeni Parola (Tekrar)"
          disabled={pending}
          {...register('newPasswordRepeat', {
            required: PASSWORD.REPEAT,
            validate: (value, formValues) => value === formValues.newPassword || PASSWORD.DO_NOT_MATCH,
          })}
          error={!!errors.newPasswordRepeat}
          helperText={errors.newPasswordRepeat?.message}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
