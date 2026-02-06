'use server';

import moment from 'moment';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

export const listShipping = async ({
  page = 1,
  pageSize = 10,
  senderName,
  consigneeName,
  consigneeCompany,
  consigneePhone,
  trackingNumber,
  startDate,
  endDate,
}: IListShippingParams) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('Yetkisiz İşlem');

  let dateQuery: Record<string, Date> | undefined;

  if (startDate && endDate) {
    dateQuery = {
      $gte: moment(startDate).startOf('day').toDate(),
      $lte: moment(endDate).endOf('day').toDate(),
    };
  }

  const match = {
    ...(senderName && { 'sender.name': { $regex: senderName, $options: 'i' } }),
    ...(consigneeName && {
      'consignee.name': { $regex: consigneeName, $options: 'i' },
    }),
    ...(consigneeCompany && {
      'consignee.company': { $regex: consigneeCompany, $options: 'i' },
    }),
    ...(consigneePhone && {
      'consignee.phone': { $regex: consigneePhone, $options: 'i' },
    }),
    ...(trackingNumber && {
      'carrier.trackingNumber': {
        $regex: trackingNumber,
        $options: 'i',
      },
    }),
    ...(dateQuery && { createdAt: dateQuery }),
    ...(currentUser.role === 'CUSTOMER' ? { userId: currentUser.id } : {}),
  };

  const result = await Shipping.paginate(match, {
    sort: { createdAt: -1 },
    page,
    limit: Math.min(pageSize, 100),
    lean: true,
    projection: {
      sender: { name: 1 },
      consignee: {
        name: 1,
        address: { country: 1, state: 1, city: 1 },
      },
      content: 1,
      package: 1,
      carrier: 1,
      createdAt: 1,
    },
  });

  return result;
};
