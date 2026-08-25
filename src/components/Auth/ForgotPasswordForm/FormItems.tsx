import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { HCaptcha } from '@/components';
import { captchaMessages, userMessages } from '@/constants';

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.IForgotPasswordPayload>;
  control: Control<AuthTypes.IForgotPasswordPayload>;
  captchaKey: number;
};

const FormItems = ({ errors, control, captchaKey }: FormItemsProps) => {
  return (
    <>
      <Controller
        name="email"
        control={control}
        rules={{
          required: userMessages.EMAIL.REQUIRED,
          pattern: {
            value: /^\S+@\S+$/i,
            message: userMessages.EMAIL.INVALID,
          },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="E-Posta"
            type="email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email?.message}
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

      <Controller
        name="recaptchaToken"
        control={control}
        rules={{
          required: captchaMessages.REQUIRED,
        }}
        render={({ field }) => (
          <Box sx={{ mt: 2 }}>
            <HCaptcha key={captchaKey} onVerify={field.onChange} onExpire={() => field.onChange('')} />

            {errors.recaptchaToken && (
              <Typography
                variant="caption"
                color="error"
                sx={{
                  display: 'block',
                  mt: 1,
                }}
              >
                {errors.recaptchaToken.message}
              </Typography>
            )}
          </Box>
        )}
      />
    </>
  );
};

export default FormItems;
