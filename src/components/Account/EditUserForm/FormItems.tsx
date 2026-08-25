import { Grid } from '@mui/material';
import { Control, FieldErrors } from 'react-hook-form';

import { AddressFields, ContactFields, NickNameField, PersonalFields, TaxFields } from '@/components';
import { UserTypes } from '@/types/user';

type FormFieldsProps = {
  errors: FieldErrors<UserTypes.IEditUserPayload>;
  control: Control<UserTypes.IEditUserPayload>;
};

const FormItems = ({ errors, control }: FormFieldsProps) => {
  return (
    <Grid container spacing={3}>
      <PersonalFields errors={errors} control={control} />
      <NickNameField errors={errors} control={control} />
      <ContactFields errors={errors} control={control} />
      <TaxFields errors={errors} control={control} />
      <AddressFields errors={errors} control={control} />
    </Grid>
  );
};

export default FormItems;
