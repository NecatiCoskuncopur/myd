import { redirect } from 'next/navigation';

import getShipping from '@/app/actions/shipping/getShipping';
import { EditShippingForm } from '@/components';

type EditShippingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditShippingPage = async ({ params }: EditShippingPageProps) => {
  const { id } = await params;

  const response = await getShipping(id);

  if (response.status !== 'OK' || !response.data) {
    redirect('/panel/gonderilerim');
  }

  const shipping = response.data;

  if (shipping.carrier?.trackingNumber) {
    redirect(`/panel/gonderilerim/${id}`);
  }

  return (
    <EditShippingForm
      initialValues={{
        shippingId: shipping._id,
        consignee: shipping.consignee,
        detail: shipping.detail,
        content: shipping.content,
        sender: shipping.sender,
        package: shipping.package,
      }}
    />
  );
};

export default EditShippingPage;
