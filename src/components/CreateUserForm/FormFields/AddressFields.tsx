import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Grid, InputAdornment, TextField } from '@mui/material';
import EnvironmentOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { addressMessages } from '@/constants';
import { AdminTypes } from '@/types/admin';

type AddressFieldsProps = {
  errors: FieldErrors<AdminTypes.ICreateUser>;
  control: Control<AdminTypes.ICreateUser, AdminTypes.ICreateUser>;
};

const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

const AddressFields = ({ errors, control }: AddressFieldsProps) => {
  return (
    <>
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
              required
              error={!!errors.address?.line1}
              helperText={errors.address?.line1?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 1 }}>
                      <EnvironmentOutlinedIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name="address.line2"
          control={control}
          rules={{
            validate: value => {
              if (!value) return true;
              if (value.length > 255) return LINE.MAX;
              return true;
            },
          }}
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
            <TextField {...field} label="İlçe" required fullWidth error={!!errors.address?.district} helperText={errors.address?.district?.message} />
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
          render={({ field }) => (
            <TextField {...field} label="İl" required fullWidth error={!!errors.address?.city} helperText={errors.address?.city?.message} />
          )}
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
            <TextField {...field} label="Posta Kodu" required fullWidth error={!!errors.address?.postalCode} helperText={errors.address?.postalCode?.message} />
          )}
        />
      </Grid>
    </>
  );
};

export default AddressFields;
