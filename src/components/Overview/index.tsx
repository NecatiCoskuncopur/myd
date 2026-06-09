'use client';
import { Box } from '@mui/material';
import BalanceStats from './BalanceStats';
import Shipping from './Shipping';

const Overview = () => {
  return (
    <Box>
      <Shipping />
      <BalanceStats />
    </Box>
  );
};

export default Overview;
