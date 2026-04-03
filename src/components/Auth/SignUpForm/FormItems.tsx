import React, { useState } from 'react';

import BankOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EnvironmentOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';

import { addressMessages, captchaMessages, userMessages } from '@/constants';
import HCaptchaField from '../HCaptcha';

const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE, PASSWORD } = userMessages;
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.ISignUpPayload>;
  control: Control<AuthTypes.ISignUpPayload, AuthTypes.ISignUpPayload>;
  setValue: UseFormSetValue<AuthTypes.ISignUpPayload>;
  captchaKey: number;
};

const FormItems = ({ errors, control, setValue, captchaKey }: FormItemsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="firstName"
          control={control}
          rules={{
            required: FIRSTNAME.REQUIRED,
            minLength: { value: 2, message: FIRSTNAME.MIN },
            maxLength: { value: 75, message: FIRSTNAME.MAX },
          }}
          render={({ field }) => <TextField {...field} label="Ad" fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="lastName"
          control={control}
          rules={{
            required: LASTNAME.REQUIRED,
            minLength: { value: 2, message: LASTNAME.MIN },
            maxLength: { value: 75, message: LASTNAME.MAX },
          }}
          render={({ field }) => <TextField {...field} label="Soyad" fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="company"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 2) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          }}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Firma İsmi"
              error={!!errors.company}
              helperText={errors.company?.message}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <BankOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: PHONE.REQUIRED,
            validate: value => value.length === 10 || PHONE.LENGTH,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Telefon No"
              fullWidth
              placeholder="5333022159"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <PhoneOutlinedIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      +90
                    </Typography>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: EMAIL.REQUIRED,
            pattern: {
              value: /^\S+@\S+$/i,
              message: EMAIL.INVALID,
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="E-Posta"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              onChange={e => {
                field.onChange(e);
              }}
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
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: PASSWORD.REQUIRED,
            minLength: { value: 8, message: PASSWORD.MIN },
            maxLength: { value: 255, message: PASSWORD.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Parola"
              autoComplete="new-password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
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
                    <IconButton size="small" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name="address.line1"
          control={control}
          rules={{
            required: LINE.REQUIRED,
            minLength: { value: 5, message: LINE.MIN },
            maxLength: { value: 255, message: LINE.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Adres"
              fullWidth
              error={!!errors.address?.line1}
              helperText={errors.address?.line1?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <EnvironmentOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name="address.line2"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length > 255) return LINE.MAX;
              return true;
            },
          }}
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Adres Satırı 2" fullWidth error={!!errors.address?.line2} helperText={errors.address?.line2?.message} />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name="address.district"
          control={control}
          rules={{
            required: DISTRICT.REQUIRED,
            minLength: { value: 2, message: DISTRICT.MIN },
            maxLength: { value: 25, message: DISTRICT.MAX },
          }}
          render={({ field }) => (
            <TextField {...field} label="İlçe" fullWidth error={!!errors.address?.district} helperText={errors.address?.district?.message} />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name="address.city"
          control={control}
          rules={{
            required: CITY.REQUIRED,
            minLength: { value: 2, message: CITY.MIN },
            maxLength: { value: 35, message: CITY.MAX },
          }}
          render={({ field }) => <TextField {...field} label="İl" fullWidth error={!!errors.address?.city} helperText={errors.address?.city?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Controller
          name="address.postalCode"
          control={control}
          rules={{
            required: POSTALCODE.REQUIRED,
            validate: value => value.length === 5 || POSTALCODE.LENGTH,
          }}
          render={({ field }) => (
            <TextField {...field} label="Posta Kodu" fullWidth error={!!errors.address?.postalCode} helperText={errors.address?.postalCode?.message} />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          key={captchaKey}
          name="recaptchaToken"
          control={control}
          rules={{ required: captchaMessages.REQUIRED }}
          render={() => <HCaptchaField onVerify={token => setValue('recaptchaToken', token)} onExpire={() => setValue('recaptchaToken', '')} />}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
