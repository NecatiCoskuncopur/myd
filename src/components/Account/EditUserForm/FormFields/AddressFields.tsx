import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { UserTypes } from '@/types/user';
import { addressMessages } from '@/constants';
import { Grid, InputAdornment, TextField } from '@mui/material';
import MarkunreadMailboxOutlinedIcon from '@mui/icons-material/MarkunreadMailboxOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

type AddressFieldsProps = {
  errors: FieldErrors<UserTypes.IEditUserPayload>;
  register: UseFormRegister<UserTypes.IEditUserPayload>;
  pending: boolean;
};
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

const AddressFields = ({ errors, register, pending }: AddressFieldsProps) => {
  return (
    <>
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
              if (value.length > 255) return LINE.MAX;
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

            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MapOutlinedIcon />
                </InputAdornment>
              ),
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

            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationCityOutlinedIcon />
                </InputAdornment>
              ),
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
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MarkunreadMailboxOutlinedIcon />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
          disabled={pending}
          {...register('address.postalCode', { required: POSTALCODE.REQUIRED, validate: value => value?.length === 5 || POSTALCODE.LENGTH })}
          error={!!errors.address?.postalCode}
          helperText={errors.address?.postalCode?.message}
        />
      </Grid>
    </>
  );
};

export default AddressFields;
