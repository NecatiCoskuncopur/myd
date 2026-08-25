'use client';

import HelpIcon from '@mui/icons-material/Help';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { Grid, InputAdornment, TextField, Tooltip, Typography } from '@mui/material';
import { Control, Controller, FieldErrors, Path } from 'react-hook-form';

import { userMessages } from '@/constants';

type ContactFieldsData = {
  phone: string;
  email: string;
};

type ContactFieldsProps<T extends ContactFieldsData> = {
  errors: FieldErrors<ContactFieldsData>;
  control: Control<T>;
};

const { EMAIL, PHONE } = userMessages;

const ContactFields = <T extends ContactFieldsData>({ errors, control }: ContactFieldsProps<T>) => {
  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'phone' as Path<T>}
          control={control}
          rules={{
            required: PHONE.REQUIRED,
            validate: value => value.length === 10 || PHONE.LENGTH,
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Telefon No"
              required
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <PhoneOutlinedIcon />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        +90
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Başında sıfır olmadan 10 hane olacak şekilde giriniz. Örnek: 5333022159" arrow placement="top">
                        <HelpIcon
                          sx={{
                            fontSize: 18,
                            color: 'action.active',
                            cursor: 'pointer',
                          }}
                        />
                      </Tooltip>
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
          name={'email' as Path<T>}
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
              required
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              onChange={e => {
                field.onChange(e);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <MailOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>
    </>
  );
};

export default ContactFields;
