'use client';

import { Grid } from '@mui/material';

import HeatMap from './HeatMap';
import ShippingStats from './ShippingStats';

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
