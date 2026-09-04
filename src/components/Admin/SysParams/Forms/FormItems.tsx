import { Grid, TextField } from '@mui/material';
import type { Control, FieldErrors, FieldPath } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { sysParamMessages } from '@/constants';

type SysParamFormPayload = SysParamTypes.ICreateSysParamPayload | SysParamTypes.IUpdateSysParamPayload;

type FormItemsProps<T extends SysParamFormPayload> = {
  control: Control<T>;
  errors: FieldErrors<T>;
};

const { KEY, VALUE } = sysParamMessages;

const FormItems = <T extends SysParamFormPayload>({ control, errors }: FormItemsProps<T>) => {
  const fieldName = <K extends FieldPath<T>>(name: K) => name;

  return (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Controller
          name={fieldName('key' as FieldPath<T>)}
          control={control}
          rules={{
            required: KEY.REQUIRED,
            minLength: {
              value: 2,
              message: KEY.MIN,
            },
            maxLength: {
              value: 100,
              message: KEY.MAX,
            },
            pattern: {
              value: /^[A-Z][A-Z0-9_]*$/,
              message: KEY.MATCH,
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              fullWidth
              label="Anahtar"
              error={!!errors.key}
              helperText={errors.key?.message as string | undefined}
              onChange={event => {
                field.onChange(event.target.value.toUpperCase());
              }}
            />
          )}
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Controller
          name={fieldName('value' as FieldPath<T>)}
          control={control}
          rules={{
            required: VALUE.REQUIRED,
            minLength: {
              value: 1,
              message: VALUE.MIN,
            },
            maxLength: {
              value: 1000,
              message: VALUE.MAX,
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              fullWidth
              label="Değer"
              error={!!errors.value}
              helperText={errors.value?.message as string | undefined}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default FormItems;
