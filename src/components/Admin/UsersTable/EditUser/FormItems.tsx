import React from 'react';

import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import MarkunreadMailboxOutlinedIcon from '@mui/icons-material/MarkunreadMailboxOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import { Autocomplete, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { addressMessages, userMessages } from '@/constants';
import { AdminTypes } from '@/types/admin';

const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE } = userMessages;
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

type FormItemsProps = {
  control: Control<AdminTypes.ISetUserPayload, AdminTypes.ISetUserPayload>;
  errors: FieldErrors<AdminTypes.ISetUserPayload>;
  pricingLists: PricingListTypes.IPricingList[];
  carrierAccounts: CarrierAccountTypes.ICarrierAccount[] | [];
};

const FormItems = ({ control, errors, pricingLists, carrierAccounts }: FormItemsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Kişisel Bilgiler
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Controller
          name="firstName"
          control={control}
          rules={{
            required: FIRSTNAME.REQUIRED,
            minLength: { value: 2, message: FIRSTNAME.MIN },
            maxLength: { value: 75, message: FIRSTNAME.MAX },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Ad"
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
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
          render={({ field }) => (
            <TextField
              {...field}
              label="Soyad"
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Controller
          name="company"
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length < 2) return COMPANY.MIN;
              if (value.length > 75) return COMPANY.MAX;
              return true;
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Şirket"
              fullWidth
              error={!!errors.company}
              helperText={errors.company?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={12} sx={{ my: 1 }}>
        <Divider />
      </Grid>
      <Grid size={12}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
          İletişim & Adres Bilgileri
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
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
              label="Telefon"
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              slotProps={{
                inputLabel: { shrink: true },
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
          )}
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
          render={({ field }) => (
            <TextField
              {...field}
              label="E-Posta"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={12}>
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
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={12}>
        <Controller
          name="address.line2"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Adres Satırı 2"
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
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
          render={({ field }) => (
            <TextField
              {...field}
              label="İlçe"
              fullWidth
              error={!!errors.address?.district}
              helperText={errors.address?.district?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
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
          render={({ field }) => (
            <TextField
              {...field}
              label="Şehir"
              fullWidth
              error={!!errors.address?.city}
              helperText={errors.address?.city?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCityOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
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
          render={({ field }) => (
            <TextField
              {...field}
              label="Posta Kodu"
              fullWidth
              error={!!errors.address?.postalCode}
              helperText={errors.address?.postalCode?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MarkunreadMailboxOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

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

      <Grid size={{ xs: 12, lg: 6 }}>
        <Controller
          name="priceListId"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.priceListId}>
              <InputLabel shrink>Fiyat Listesi</InputLabel>
              <Select
                {...field}
                label="Fiyat Listesi"
                value={field.value || ''}
                startAdornment={
                  <InputAdornment position="start">
                    <PriceChangeOutlinedIcon />
                  </InputAdornment>
                }
              >
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
              options={carrierAccounts}
              getOptionLabel={option => option.name || ''}
              value={carrierAccounts.filter(acc => field.value?.includes(acc._id))}
              onChange={(_, newValue) => {
                const selectedIds = newValue.map(item => item._id);
                field.onChange(selectedIds);
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
