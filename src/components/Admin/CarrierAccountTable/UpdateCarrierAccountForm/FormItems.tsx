import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { Box, Checkbox, Divider, FormControlLabel, Grid, MenuItem, TextField, Typography, useTheme } from '@mui/material';
import CustomInfoSection from '../CustomInfoSection';
import { Carrier, carrierMessages } from '@/constants';
import { PricingZoneEditor } from '@/components';
import React from 'react';

type FormItemsProps = {
  control: Control<CarrierAccountTypes.IUpdateCarrierAccountPayload, CarrierAccountTypes.IUpdateCarrierAccountPayload>;
  errors: FieldErrors<CarrierAccountTypes.IUpdateCarrierAccountPayload>;
  hasCustomInfo: boolean | undefined;
  credentials: CarrierAccountTypes.ICarrierCredential[] | undefined;
  setValue: UseFormSetValue<CarrierAccountTypes.IUpdateCarrierAccountPayload>;
  account: CarrierAccountTypes.ICarrierAccount | null;
};

const { ACCOUNTNUMBER, NAME } = carrierMessages;

const FormItems = ({ control, errors, hasCustomInfo, credentials, setValue, account }: FormItemsProps) => {
  const mode = useTheme().palette.mode;

  const borderDashed = mode === 'light' ? '1px dashed rgba(0,0,0,0.12)' : '1px dashed rgba(255,255,255,0.2)';
  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="name"
          control={control}
          rules={{ required: NAME.REQUIRED }}
          render={({ field }) => <TextField {...field} fullWidth label="Hesap Adı" error={!!errors.name} helperText={errors.name?.message} />}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="accountNumber"
          control={control}
          rules={{ required: ACCOUNTNUMBER.REQUIRED }}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Hesap Numarası" error={!!errors.accountNumber} helperText={errors.accountNumber?.message} />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Hesap Durumu"
              value={field.value ? 'true' : 'false'}
              onChange={e => field.onChange(e.target.value === 'true')}
              error={!!errors.isActive}
              helperText={errors.isActive?.message}
            >
              <MenuItem value="true">Aktif</MenuItem>
              <MenuItem value="false">Pasif</MenuItem>
            </TextField>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name="carrier"
          control={control}
          render={({ field }) => (
            <TextField {...field} select fullWidth label="Kargo Firması">
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

                    if (checked && !account?.customInfo) {
                      setValue('customInfo', {
                        email: '',
                        firstName: '',
                        lastName: '',
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

                    if (!checked) {
                      setValue('customInfo', undefined);
                    }
                  }}
                />
              }
              label="Özel gönderici bilgileri kullan"
            />
          )}
        />
      </Grid>

      {hasCustomInfo && (
        <Grid size={{ xs: 12 }}>
          <CustomInfoSection control={control} errors={errors} />
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Box sx={{ p: 2, border: borderDashed, borderRadius: 1 }}>
          <Grid container spacing={2}>
            {credentials?.map((item, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.key}>
                <Controller
                  name={`credentials.${index}.value` as const}
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth label={item.key} error={!!errors.credentials?.[index]?.value} />}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Divider sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Fiyatlandırma</Typography>
        </Divider>

        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Bu taşıyıcı hesabı için ağırlık bazlı maliyet kurallarını tanımlayın.
        </Typography>

        <Controller name="pricing.zones" control={control} render={({ field }) => <PricingZoneEditor value={field.value} onChange={field.onChange} />} />
      </Grid>
    </Grid>
  );
};

export default FormItems;
