'use client';

import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';

import { PasswordTextField } from '@/components';
import { userMessages } from '@/constants';

const { PASSWORD } = userMessages;

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.IResetPasswordForm>;
  control: Control<AuthTypes.IResetPasswordForm>;
};

const FormItems = ({ errors, control }: FormItemsProps) => {
  const newPassword = useWatch({
    control,
    name: 'newPassword',
  });

  return (
    <>
      <Controller
        name="newPassword"
        control={control}
        rules={{
          required: PASSWORD.REQUIRED,
          minLength: {
            value: 8,
            message: PASSWORD.MIN,
          },
          maxLength: {
            value: 255,
            message: PASSWORD.MAX,
          },
        }}
        render={({ field }) => (
          <PasswordTextField {...field} label="Yeni Parola" margin="normal" error={!!errors.newPassword} helperText={errors.newPassword?.message} />
        )}
      />

      <Controller
        name="newPasswordRepeat"
        control={control}
        rules={{
          required: PASSWORD.REPEAT,
          validate: value => value === newPassword || PASSWORD.DO_NOT_MATCH,
        }}
        render={({ field }) => (
          <PasswordTextField
            {...field}
            label="Yeni Parola Tekrar"
            margin="normal"
            error={!!errors.newPasswordRepeat}
            helperText={errors.newPasswordRepeat?.message}
          />
        )}
      />
    </>
  );
};

export default FormItems;
