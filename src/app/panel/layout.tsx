import DashboardShell from '@/components/Dashboard/Layout/DashboardShell';
import { getCurrentUser } from '@/lib/getCurrentUser';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  return <DashboardShell role={currentUser?.role || ''}>{children}</DashboardShell>;
};

export default DashboardLayout;
