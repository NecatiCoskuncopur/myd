import React from 'react';

import getUser from '@/app/actions/user/getUser';
import { DashboardShell } from '@/components';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const response = await getUser();
  const user = response.status === 'OK' ? response.data : undefined;

  return <DashboardShell user={user}>{children}</DashboardShell>;
};

export default DashboardLayout;
