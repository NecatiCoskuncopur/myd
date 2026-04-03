import React, { useState } from 'react';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { userMessages } from '@/constants';

const { PASSWORD } = userMessages;

type FormItemProps = {
  register: UseFormRegister<UserTypes.IChangePasswordFormUI>;
  errors: FieldErrors<UserTypes.IChangePasswordFormUI>;
  pending: boolean;
};

const FormItems = ({ register, errors, pending }: FormItemProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label="Mevcut Parola"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          disabled={pending}
          {...register('currentPassword', {
            required: PASSWORD.REQUIRED,
            minLength: { value: 8, message: PASSWORD.MIN },
            maxLength: { value: 255, message: PASSWORD.MAX },
          })}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label="Yeni Parola"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          disabled={pending}
          {...register('newPassword', {
            required: PASSWORD.REQUIRED,
            minLength: { value: 8, message: PASSWORD.MIN },
            maxLength: { value: 255, message: PASSWORD.MAX },
          })}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          label="Yeni Parola (Tekrar)"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          disabled={pending}
          {...register('newPasswordRepeat', {
            required: PASSWORD.REPEAT,
            validate: (value, formValues) => value === formValues.newPassword || PASSWORD.DO_NOT_MATCH,
          })}
          error={!!errors.newPasswordRepeat}
          helperText={errors.newPasswordRepeat?.message}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
