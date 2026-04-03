import React, { useState } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { userMessages } from '@/constants';

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.IResetPasswordForm>;
  control: Control<AuthTypes.IResetPasswordForm, AuthTypes.IResetPasswordForm>;
  newPassword: string;
};

const { PASSWORD } = userMessages;

const FormItems = ({ errors, control, newPassword }: FormItemsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <Controller
        name="newPassword"
        control={control}
        rules={{
          required: PASSWORD.REQUIRED,
          minLength: { value: 8, message: PASSWORD.MIN },
          maxLength: { value: 255, message: PASSWORD.MAX },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Yeni Parola"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            fullWidth
            margin="normal"
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" size="small" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
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
          <TextField
            {...field}
            label="Yeni Parola Tekrar"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            fullWidth
            margin="normal"
            error={!!errors.newPasswordRepeat}
            helperText={errors.newPasswordRepeat?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" size="small" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </>
  );
};

export default FormItems;
