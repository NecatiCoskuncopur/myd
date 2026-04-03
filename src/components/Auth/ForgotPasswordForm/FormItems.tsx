import React from 'react';

import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';

import { captchaMessages, userMessages } from '@/constants';
import HCaptchaField from '../HCaptcha';

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.IForgotPasswordPayload>;
  control: Control<AuthTypes.IForgotPasswordPayload, AuthTypes.IForgotPasswordPayload>;
  setValue: UseFormSetValue<AuthTypes.IForgotPasswordPayload>;
  captchaKey: number;
};

const FormItems = ({ errors, control, setValue, captchaKey }: FormItemsProps) => {
  return (
    <>
      <Controller
        name="email"
        control={control}
        rules={{
          required: userMessages.EMAIL.REQUIRED,
          pattern: {
            value: /^\S+@\S+$/i,
            message: userMessages.EMAIL.INVALID,
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="E-Posta"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <MailOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Controller
        name="recaptchaToken"
        control={control}
        rules={{ required: captchaMessages.REQUIRED }}
        render={() => (
          <Box mt={2}>
            <HCaptchaField
              key={captchaKey}
              onVerify={token =>
                setValue('recaptchaToken', token, {
                  shouldValidate: true,
                })
              }
              onExpire={() =>
                setValue('recaptchaToken', '', {
                  shouldValidate: true,
                })
              }
            />
            {errors.recaptchaToken && (
              <Typography variant="caption" color="error" display="block" mt={1}>
                {errors.recaptchaToken.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </>
  );
};

export default FormItems;
