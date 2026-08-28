import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { PasswordTextField, TurnstileCaptcha } from '@/components';
import { captchaMessages, userMessages } from '@/constants';

type FormItemsProps = {
  errors: FieldErrors<AuthTypes.ISignInPayload>;
  control: Control<AuthTypes.ISignInPayload>;
  captchaKey: number;
};

const { EMAIL, PASSWORD } = userMessages;

const FormItems = ({ errors, control, captchaKey }: FormItemsProps) => {
  return (
    <>
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
            type="email"
            inputMode="email"
            autoComplete="email"
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
                endAdornment: <InputAdornment position="end" sx={{ width: 40 }} />,
              },
            }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{
          required: PASSWORD.REQUIRED,
          minLength: {
            value: 8,
            message: PASSWORD.MIN,
          },
          maxLength: {
            value: 255,
            message: PASSWORD.MAX,
          },
        }}
        render={({ field }) => (
          <PasswordTextField
            {...field}
            label="Parola"
            autoComplete="current-password"
            margin="normal"
            error={!!errors.password}
            helperText={errors.password?.message}
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
    </>
  );
};

export default FormItems;
