import { Grid } from '@mui/material';
import { Control, FieldErrors } from 'react-hook-form';

import { AddressFields, ContactFields, NickNameField, PasswordField, PersonalFields, TaxFields } from '@/components';
import { AdminTypes } from '@/types/admin';

type FormItemsProps = {
  errors: FieldErrors<AdminTypes.ICreateUser>;
  control: Control<AdminTypes.ICreateUser, AdminTypes.ICreateUser>;
};

const FormItems = ({ errors, control }: FormItemsProps) => {
  return (
    <Grid container spacing={2}>
      <PersonalFields control={control} errors={errors} />
      <NickNameField errors={errors} control={control} />
      <ContactFields control={control} errors={errors} />
      <TaxFields errors={errors} control={control} />
      <Grid size={{ xs: 12 }}>
        <PasswordField errors={errors} control={control} />
      </Grid>
      <AddressFields control={control} errors={errors} />
    </Grid>
  );
};

export default FormItems;
