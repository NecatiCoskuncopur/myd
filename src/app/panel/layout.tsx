import { DashboardShell } from '@/components';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardLayout;
