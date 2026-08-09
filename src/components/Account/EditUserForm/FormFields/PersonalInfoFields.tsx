import { Grid, InputAdornment, TextField } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BankOutlinedIcon from '@mui/icons-material/AccountBalance';
import React from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { UserTypes } from '@/types/user';
import { userMessages } from '@/constants';

type PersonalInfoFieldsProps = {
  errors: FieldErrors<UserTypes.IEditUserPayload>;
  register: UseFormRegister<UserTypes.IEditUserPayload>;
  pending: boolean;
};

const { COMPANY, FIRSTNAME, LASTNAME } = userMessages;

const PersonalInfoFields = ({ errors, register, pending }: PersonalInfoFieldsProps) => {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Ad"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon />
                </InputAdornment>
              ),
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

            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeOutlinedIcon />
                </InputAdornment>
              ),
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
              if (value.length < 5) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          })}
          error={!!errors.company}
          helperText={errors.company?.message}
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
    </>
  );
};

export default PersonalInfoFields;
