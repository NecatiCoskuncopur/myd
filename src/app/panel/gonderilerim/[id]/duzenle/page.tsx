import { redirect } from 'next/navigation';

import getShipping from '@/app/actions/shipping/getShipping';
import { EditShippingForm } from '@/components';

interface Props {
  params: { id: string };
}

const EditShippingPage = async ({ params }: Props) => {
  const { id } = await params;
  const res = await getShipping(id);

  if (res.status !== 'OK' || !res.data) {
    redirect('/panel/gonderilerim');
  }

  if (res.data.carrier?.trackingNumber) {
    redirect(`/panel/gonderilerim/${id}`);
  }

  return <EditShippingForm />;
};

export default EditShippingPage;
