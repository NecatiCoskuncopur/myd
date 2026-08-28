import { Box, Grid, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { AddressFields, ContactFields, PasswordField, PersonalFields, TaxFields, TurnstileCaptcha } from '@/components';
import { captchaMessages } from '@/constants';

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.ISignUpPayload>;
  control: Control<AuthTypes.ISignUpPayload>;
  captchaKey: number;
};

const FormItems = ({ errors, control, captchaKey }: FormItemsProps) => {
  return (
    <Grid container spacing={2}>
      <PersonalFields control={control} errors={errors} />

      <ContactFields control={control} errors={errors} />

      <Grid size={{ xs: 12, md: 6 }}>
        <PasswordField errors={errors} control={control} />
      </Grid>

      <TaxFields errors={errors} control={control} />

      <AddressFields control={control} errors={errors} />

      <Grid size={12}>
        <Controller
          name="recaptchaToken"
          control={control}
          rules={{
            required: captchaMessages.REQUIRED,
          }}
          render={({ field }) => (
            <Box>
              <TurnstileCaptcha key={captchaKey} onVerify={field.onChange} onExpire={() => field.onChange('')} />

              {errors.recaptchaToken && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{
                    mt: 1,
                    display: 'block',
                  }}
                >
                  {errors.recaptchaToken.message}
                </Typography>
              )}
            </Box>
          )}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
