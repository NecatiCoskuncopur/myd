'use client';

import BalanceStats from './BalanceStats';
import ShippingStats from './ShippingStats';

const Overview = () => {
  return (
    <>
      <ShippingStats />
      <BalanceStats />
    </>
  );
};

export default Overview;
