import React from 'react';

import { Autocomplete, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { messages } from '@/constants';

const { ADDRESS, USER } = messages;
const { CITY, DISTRICT, LINE, POSTALCODE } = ADDRESS;
const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE } = USER;

const barcodeOptions: string[] = ['FEDEX-1', 'FEDEX-2', 'UPS-1', 'UPS-2'];

type FormItemsProps = {
  control: Control<ISetUserPayload, ISetUserPayload>;
  errors: FieldErrors<ISetUserPayload>;
  pricingLists: IPricingList[];
};

const FormItems = ({ control, errors, pricingLists }: FormItemsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Controller
          name="company"
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 5) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          }}
          render={({ field }) => <TextField {...field} label="Şirket" fullWidth error={!!errors.company} helperText={errors.company?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: PHONE.REQUIRED,
            validate: value => value.length === 10 || PHONE.LENGTH,
          }}
          render={({ field }) => <TextField {...field} label="Telefon" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
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
          render={({ field }) => <TextField {...field} label="E-Posta" fullWidth error={!!errors.email} helperText={errors.email?.message} />}
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
          render={({ field }) => <TextField {...field} label="Adres" fullWidth />}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller name="address.line2" control={control} render={({ field }) => <TextField {...field} label="Adres Satırı 2" fullWidth />} />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Controller
          name="address.district"
          control={control}
          rules={{
            required: DISTRICT.REQUIRED,
            minLength: { value: 2, message: DISTRICT.MIN },
            maxLength: { value: 25, message: DISTRICT.MAX },
          }}
          render={({ field }) => <TextField {...field} label="İlçe" fullWidth />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Controller
          name="address.city"
          control={control}
          rules={{
            required: CITY.REQUIRED,
            minLength: { value: 2, message: CITY.MIN },
            maxLength: { value: 35, message: CITY.MAX },
          }}
          render={({ field }) => <TextField {...field} label="Şehir" fullWidth />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Controller
          name="address.postalCode"
          control={control}
          rules={{
            required: POSTALCODE.REQUIRED,
            validate: value => value.length === 5 || POSTALCODE.LENGTH,
          }}
          render={({ field }) => <TextField {...field} label="Posta Kodu" fullWidth />}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Üye Rolü</InputLabel>
              <Select {...field} label="Üye Rolü">
                <MenuItem value="CUSTOMER">Müşteri</MenuItem>
                <MenuItem value="ADMIN">Yönetici</MenuItem>
                <MenuItem value="OPERATOR">Operatör</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Hesap Durumu</InputLabel>
              <Select label="Hesap Durumu" value={field.value ? 'true' : 'false'} onChange={e => field.onChange(e.target.value === 'true')}>
                <MenuItem value="true">Aktif</MenuItem>
                <MenuItem value="false">Pasif</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="priceListId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>Fiyat Listesi</InputLabel>
              <Select {...field} label="Fiyat Listesi" value={field.value || ''}>
                {pricingLists.map(list => (
                  <MenuItem key={list._id} value={list._id}>
                    {list.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="barcodePermits"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={barcodeOptions}
              value={field.value ?? []}
              onChange={(_, value) => field.onChange(value)}
              renderInput={params => <TextField {...params} label="Barkod Yetkileri" />}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
