'use client';

import { Grid } from '@mui/material';
import ShippingStats from './ShippingStats';
import HeatMap from './HeatMap';

const Shipping = () => {
  return (
    <Grid container spacing={3} sx={{ alignItems: 'stretch', mb: 4 }}>
      <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
        <HeatMap />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
        <ShippingStats />
      </Grid>
    </Grid>
  );
};

export default Shipping;
