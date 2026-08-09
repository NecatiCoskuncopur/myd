import { Grid, InputAdornment, TextField } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import React from 'react';
import { userMessages } from '@/constants';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { UserTypes } from '@/types/user';

type ContactFieldsProps = {
  errors: FieldErrors<UserTypes.IEditUserPayload>;
  register: UseFormRegister<UserTypes.IEditUserPayload>;
  pending: boolean;
};

const { EMAIL, PHONE } = userMessages;
const ContactFields = ({ errors, register, pending }: ContactFieldsProps) => {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Telefon"
          fullWidth
          disabled={pending}
          {...register('phone', { required: PHONE.REQUIRED, validate: value => value.length === 10 || PHONE.LENGTH })}
          error={!!errors.phone}
          helperText={errors.phone?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlinedIcon sx={{ mr: 1 }} />
                  +90
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="E-Posta"
          fullWidth
          disabled={pending}
          {...register('email', {
            required: EMAIL.REQUIRED,
            pattern: { value: /^\S+@\S+$/i, message: EMAIL.INVALID },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
    </>
  );
};

export default ContactFields;
