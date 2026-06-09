'use client';
import { Grid } from '@mui/material';
import BalanceStats from './BalanceStats';
import HeatMap from './HeatMap';

const Overview = () => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <HeatMap />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BalanceStats />
      </Grid>
    </Grid>
  );
};

export default Overview;
