import React from 'react';

import BankOutlinedIcon from '@mui/icons-material/AccountBalance';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { Grid, InputAdornment, TextField } from '@mui/material';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

import { addressMessages, userMessages } from '@/constants';
import { UserTypes } from '@/types/user';

const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE } = userMessages;
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

type FormItemsProps = {
  errors: FieldErrors<UserTypes.IEditUserPayload>;
  register: UseFormRegister<UserTypes.IEditUserPayload>;
  pending: boolean;
};

const FormItems = ({ errors, register, pending }: FormItemsProps) => {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Ad"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
          disabled={pending}
          {...register('firstName', {
            required: FIRSTNAME.REQUIRED,
            minLength: { value: 2, message: FIRSTNAME.MIN },
            maxLength: { value: 75, message: FIRSTNAME.MAX },
          })}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Soyad"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
          disabled={pending}
          {...register('lastName', {
            required: LASTNAME.REQUIRED,
            minLength: { value: 2, message: LASTNAME.MIN },
            maxLength: { value: 75, message: LASTNAME.MAX },
          })}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Firma İsmi"
          fullWidth
          disabled={pending}
          {...register('company', {
            validate: value => {
              if (!value) return true;
              if (value.length < 2) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          })}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BankOutlinedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
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
      <Grid size={12}>
        <TextField
          label="Adres Satırı 1"
          fullWidth
          disabled={pending}
          {...register('address.line1', {
            required: LINE.REQUIRED,
            minLength: { value: 5, message: LINE.MIN },
            maxLength: { value: 255, message: LINE.MAX },
          })}
          error={!!errors.address?.line1}
          helperText={errors.address?.line1?.message}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlinedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={12}>
        <TextField
          label="Adres Satırı 2"
          fullWidth
          disabled={pending}
          {...register('address.line2', {
            validate: value => {
              if (!value) return true;
              if (value.length < 2) return LINE.MIN;
              if (value.length > 75) return LINE.MAX;
              return true;
            },
          })}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlinedIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="İlçe"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
          disabled={pending}
          {...register('address.district', {
            required: DISTRICT.REQUIRED,
            minLength: { value: 2, message: DISTRICT.MIN },
            maxLength: { value: 25, message: DISTRICT.MAX },
          })}
          error={!!errors.address?.district}
          helperText={errors.address?.district?.message}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="İl"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
          disabled={pending}
          {...register('address.city', {
            required: CITY.REQUIRED,
            minLength: { value: 2, message: CITY.MIN },
            maxLength: { value: 35, message: CITY.MAX },
          })}
          error={!!errors.address?.city}
          helperText={errors.address?.city?.message}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          label="Posta Kodu"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          fullWidth
          disabled={pending}
          {...register('address.postalCode', { required: POSTALCODE.REQUIRED, validate: value => value.length === 5 || POSTALCODE.LENGTH })}
          error={!!errors.address?.postalCode}
          helperText={errors.address?.postalCode?.message}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
