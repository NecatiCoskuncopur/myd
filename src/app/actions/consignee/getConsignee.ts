'use server';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee } from '@/models';

interface GetConsigneeParams {
  name?: string;
}

const getConsignee = async ({ name = '' }: GetConsigneeParams) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  if (!name.trim()) {
    return [];
  }

  const results = await Consignee.find({
    userId: currentUser.id,
    name: { $regex: `^${name}`, $options: 'i' },
  })
    .limit(5)
    .lean();

  return results;
};

export default getConsignee;
