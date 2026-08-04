import React from 'react';
import { Box, Checkbox, FormControlLabel, Grid, MenuItem, TextField } from '@mui/material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Carrier, carrierMessages } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import CustomInfoSection from '../CustomInfoSection';

const { ACCOUNTNUMBER, NAME } = carrierMessages;

type FormItemsProps = {
  control: Control<CarrierAccountTypes.ICreateCarrierAccountPayload, CarrierAccountTypes.ICreateCarrierAccountPayload>;
  errors: FieldErrors<CarrierAccountTypes.ICreateCarrierAccountPayload>;
  hasCustomInfo: boolean;
  credentials: CarrierAccountTypes.ICarrierCredential[];
  setValue: UseFormSetValue<CarrierAccountTypes.ICreateCarrierAccountPayload>;
};

const FormItems = ({ control, errors, hasCustomInfo, credentials, setValue }: FormItemsProps) => {
  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="name"
          rules={{
            required: NAME.REQUIRED,
            minLength: { value: 2, message: NAME.MIN },
            maxLength: { value: 75, message: NAME.MAX },
          }}
          control={control}
          render={({ field }) => <TextField {...field} fullWidth label="Hesap Adı" error={!!errors.name} helperText={errors.name?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="accountNumber"
          rules={{
            required: ACCOUNTNUMBER.REQUIRED,
            minLength: { value: 1, message: ACCOUNTNUMBER.MIN },
          }}
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Hesap Numarası" error={!!errors.accountNumber} helperText={errors.accountNumber?.message} />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name="carrier"
          control={control}
          render={({ field }) => (
            <TextField {...field} select fullWidth label="Kargo Firması" error={!!errors.carrier}>
              {Object.values(Carrier).map(carrier => (
                <MenuItem key={carrier} value={carrier}>
                  {carrier}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name="hasCustomInfo"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={e => {
                    const checked = e.target.checked;

                    field.onChange(checked);

                    if (checked) {
                      setValue('customInfo', {
                        firstName: '',
                        lastName: '',
                        email: '',
                        company: '',
                        phone: '',
                        address: {
                          line1: '',
                          line2: '',
                          city: '',
                          district: '',
                          postalCode: '',
                        },
                      });
                    }
                  }}
                />
              }
              label="Adres bilgisi eklemek istiyorum"
            />
          )}
        />
      </Grid>

      {hasCustomInfo && <CustomInfoSection errors={errors} control={control} />}

      <Grid size={{ xs: 12 }}>
        <Box sx={{ p: 2, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 1 }}>
          <Grid container spacing={2}>
            {credentials?.map((item, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.key}>
                <Controller
                  name={`credentials.${index}.value` as const}
                  control={control}
                  rules={{ required: 'Bu alan zorunludur' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={item.key === 'apiKey' ? 'API Key' : item.key === 'secretKey' ? 'Secret Key' : item.key}
                      error={!!errors.credentials?.[index]?.value}
                      helperText={errors.credentials?.[index]?.value?.message}
                    />
                  )}
                />
                <Controller name={`credentials.${index}.key` as const} control={control} render={({ field }) => <input type="hidden" {...field} />} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default FormItems;
