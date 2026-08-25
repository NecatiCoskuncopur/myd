import { ResetPasswordForm } from '@/components';

type ResetPasswordPageProps = {
  params: Promise<{
    secret: string;
  }>;
};

const ResetPasswordPage = async ({ params }: ResetPasswordPageProps) => {
  const { secret } = await params;

  return <ResetPasswordForm secret={secret} />;
};

export default ResetPasswordPage;
