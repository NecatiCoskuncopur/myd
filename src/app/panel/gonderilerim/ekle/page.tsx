import getUser from '@/app/actions/user/getUser';
import { CreateShippingForm } from '@/components';

const CreateShippingPage = async () => {
  const response = await getUser();

  return <CreateShippingForm user={response?.data} />;
};

export default CreateShippingPage;
