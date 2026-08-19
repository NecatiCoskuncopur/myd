import React from 'react';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import { Autocomplete, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { CarrierAccountTypeEnum } from '@/constants';
import { AddressFields, ContactFields, NickNameField, PersonalFields, TaxFields } from '@/components';
import { AdminTypes } from '@/types/admin';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';

type FormItemsProps = {
  control: Control<AdminTypes.ISetUserPayload, AdminTypes.ISetUserPayload>;
  errors: FieldErrors<AdminTypes.ISetUserPayload>;
  pricingLists: PricingListTypes.IPricingList[];
  carrierAccounts: CarrierAccountTypes.ICarrierAccount[] | [];
};

const FormItems = ({ control, errors, pricingLists, carrierAccounts }: FormItemsProps) => {
  const priceListTypes = Object.values(CarrierAccountTypeEnum);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Kişisel Bilgiler
        </Typography>
      </Grid>

      <PersonalFields control={control} errors={errors} />

      <NickNameField errors={errors} control={control} />

      <TaxFields errors={errors} control={control} />

      <Grid size={12} sx={{ my: 1 }}>
        <Divider />
      </Grid>

      <Grid size={12}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          İletişim & Adres Bilgileri
        </Typography>
      </Grid>

      <ContactFields control={control} errors={errors} />

      <AddressFields control={control} errors={errors} />

      <Grid size={12} sx={{ my: 1 }}>
        <Divider />
      </Grid>

      <Grid size={12}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Sistem & Yetkilendirme
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel shrink>Üye Rolü</InputLabel>

              <Select
                {...field}
                label="Üye Rolü"
                startAdornment={
                  <InputAdornment position="start">
                    <AdminPanelSettingsOutlinedIcon />
                  </InputAdornment>
                }
              >
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
              <InputLabel shrink>Hesap Durumu</InputLabel>

              <Select
                label="Hesap Durumu"
                value={field.value ? 'true' : 'false'}
                onChange={e => field.onChange(e.target.value === 'true')}
                startAdornment={
                  <InputAdornment position="start">
                    <CheckCircleOutlinedIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="true">Aktif</MenuItem>
                <MenuItem value="false">Pasif</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </Grid>

      {priceListTypes.map((type, index) => {
        const filteredPricingLists = pricingLists.filter(list => list.listType === type);

        return (
          <Grid size={{ xs: 12, lg: 3 }} key={type}>
            <Controller
              name={`priceLists.${index}.serviceType`}
              control={control}
              defaultValue={type}
              render={({ field }) => <input type="hidden" {...field} value={type} />}
            />

            <Controller
              name={`priceLists.${index}.priceListId`}
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.priceLists?.[index]?.priceListId}>
                  <InputLabel shrink>{type} Fiyat Listesi</InputLabel>

                  <Select
                    {...field}
                    value={filteredPricingLists.some(list => list._id === field.value) ? field.value : ''}
                    label={`${type} Fiyat Listesi`}
                    startAdornment={
                      <InputAdornment position="start">
                        <PriceChangeOutlinedIcon />
                      </InputAdornment>
                    }
                  >
                    {filteredPricingLists.map(list => (
                      <MenuItem key={list._id} value={list._id}>
                        {list.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        );
      })}

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="barcodePermits"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={carrierAccounts}
              getOptionLabel={option => option.name || ''}
              value={carrierAccounts.filter(acc => field.value?.includes(acc._id))}
              onChange={(_, newValue) => {
                field.onChange(newValue.map(item => item._id));
              }}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Barkod Yetkileri"
                  placeholder="Hesap Seçin"
                  error={!!errors.barcodePermits}
                  helperText={errors.barcodePermits?.message}
                />
              )}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
