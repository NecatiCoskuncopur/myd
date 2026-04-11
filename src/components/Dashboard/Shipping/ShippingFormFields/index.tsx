import { Grid } from '@mui/material';

import ConsigneeSection from './ConsigneeSection';
import PackageContentSection from './PackageContentSection';
import PackageDetailSection from './PackageDetailSection';
import SenderSection from './SenderSection';
import ShippingDetailSection from './ShippingDetailSection';

type ShippingFormFieldsProps = {
  user: UserTypes.IUser | null;
};

const ShippingFormFields = ({ user }: ShippingFormFieldsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
        <ConsigneeSection />
        <ShippingDetailSection />
      </Grid>

      <Grid container size={{ xs: 12, md: 6 }} spacing={2}>
        {user?.role !== 'CUSTOMER' && <SenderSection />}
        <PackageContentSection />
        <PackageDetailSection />
      </Grid>
    </Grid>
  );
};

export default ShippingFormFields;
