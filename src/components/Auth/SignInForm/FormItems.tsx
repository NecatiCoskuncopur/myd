import React, { useState } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';

import { messages } from '@/constants';
import HCaptchaField from '../HCaptcha';

type FormItemsProps = {
  errors: FieldErrors<ISignInPayload>;
  control: Control<ISignInPayload, ISignInPayload>;
  setValue: UseFormSetValue<ISignInPayload>;
  captchaKey: number;
};

const { CAPTCHA, PASSWORD, USER } = messages;

const FormItems = ({ errors, control, setValue, captchaKey }: FormItemsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <Controller
        name="email"
        control={control}
        rules={{
          required: USER.EMAIL.REQUIRED,
          pattern: {
            value: /^\S+@\S+$/i,
            message: USER.EMAIL.INVALID,
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
              endAdornment: <InputAdornment position="end" sx={{ width: 40 }} />,
            }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: PASSWORD.REQUIRED,
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Parola"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(prev => !prev)}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                  >
                    {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Controller
        name="recaptchaToken"
        control={control}
        rules={{ required: CAPTCHA.REQUIRED }}
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
