import { Grid, InputAdornment, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import React from 'react';
import { userMessages } from '@/constants';
import { AdminTypes } from '@/types/admin';
import BankOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';

type PersonalnfoFieldsProps = {
  errors: FieldErrors<AdminTypes.ICreateUser>;
  control: Control<AdminTypes.ICreateUser, AdminTypes.ICreateUser>;
};

const { COMPANY, FIRSTNAME, LASTNAME, NICKNAME } = userMessages;

const PersonalInfoFields = ({ errors, control }: PersonalnfoFieldsProps) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="firstName"
          control={control}
          rules={{
            required: FIRSTNAME.REQUIRED,
            minLength: { value: 2, message: FIRSTNAME.MIN },
            maxLength: { value: 75, message: FIRSTNAME.MAX },
          }}
          render={({ field }) => <TextField {...field} label="Ad" required fullWidth error={!!errors.firstName} helperText={errors.firstName?.message} />}
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
          render={({ field }) => <TextField {...field} label="Soyad" required fullWidth error={!!errors.lastName} helperText={errors.lastName?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="company"
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 5) return COMPANY.MIN;
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <BankOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="nickname"
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 4) return NICKNAME.MIN;
              if (value.length > 75) return NICKNAME.MAX;
              return true;
            },
          }}
          render={({ field }) => <TextField {...field} label="Kullanıcı Adı" fullWidth error={!!errors.nickname} helperText={errors.nickname?.message} />}
        />
      </Grid>
    </>
  );
};

export default PersonalInfoFields;
