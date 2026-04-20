'use server';

import * as Sentry from '@sentry/nextjs';
import json2xls from 'json2xls';
import moment from 'moment';
import { PaginateModel } from 'mongoose';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const listShipping = async (
  params: ShippingTypes.IListShippingParams,
): Promise<ResponseTypes.IActionResponse<ShippingTypes.IShippingData | ShippingTypes.IShippingExcel>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const { page = 1, limit = 5, trackingNumber, startDate, endDate, download, senderName, consigneeName, consigneeCompany, consigneePhone } = params;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const match: Record<string, unknown> = {
      userId: currentUser.id,
    };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate(),
      };
    }

    const createRegex = (val: string) => ({
      $regex: val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    });

    if (trackingNumber) match['carrier.trackingNumber'] = createRegex(trackingNumber);
    if (senderName) match['sender.name'] = createRegex(senderName);
    if (consigneeName) match['consignee.name'] = createRegex(consigneeName);
    if (consigneeCompany) match['consignee.company'] = createRegex(consigneeCompany);
    if (consigneePhone) match['consignee.phone'] = createRegex(consigneePhone);

    if (download) {
      const shipping = await Shipping.find(match).select('sender consignee content package carrier createdAt').limit(10000).lean<ShippingTypes.IShipping[]>();

      const excelData = shipping.map(item => {
        const totalProductValue = item.content?.products?.reduce((prev, { piece = 0, unitPrice = 0 }) => prev + piece * unitPrice, 0) ?? 0;

        const productNames = item.content?.products?.map(p => p.name).join(', ') ?? '';

        return {
          'Gönderici Adı': item.sender?.name || '',
          'Gönderici Firma': item.sender?.company || '',
          'Alıcı Adı': item.consignee?.name || '',
          'Alıcı Adres': `${item.consignee?.address?.line1 ?? ''} ${item.consignee?.address?.line2 ?? ''} ${item.consignee?.address?.city ?? ''}`.trim(),
          'Alıcı Ülke': item.consignee?.address?.country || '',
          'Alıcı Eyalet': item.consignee?.address?.state ?? '',
          'Alıcı Posta Kodu': item.consignee?.address?.postalCode || '',
          'Takip Kodu': item.carrier?.trackingNumber ?? '',
          'Ağırlık/Desi': item.package?.weight || 0,
          Tutar: item.carrier?.amount ?? '',
          İçerik: productNames,
          'İçerik Toplam Tutarı': totalProductValue,
          Tarih: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD') : '',
        };
      });

      const excelBuffer = json2xls(excelData);
      const base64Content = Buffer.isBuffer(excelBuffer) ? excelBuffer.toString('base64') : Buffer.from(excelBuffer, 'binary').toString('base64');

      return {
        status: 'OK',
        data: {
          fileName: `gonderiler_${moment().format('DD-MM-YYYY')}.xls`,
          content: base64Content,
        },
      };
    }

    const shippingModel = Shipping as typeof Shipping & PaginateModel<ShippingTypes.IShipping>;

    const result = await shippingModel.paginate(match, {
      sort: { createdAt: -1 },
      page: safePage,
      limit: safeLimit,
      lean: true,
      projection: {
        sender: { name: 1 },
        consignee: {
          name: 1,
          address: { country: 1, state: 1, city: 1 },
        },
        content: { currency: 1, products: 1 },
        package: 1,
        carrier: 1,
        createdAt: 1,
      },
    });

    const serializedShippings = JSON.parse(JSON.stringify(result.docs));

    return {
      status: 'OK',
      data: {
        shippings: serializedShippings,
        totalCount: result.totalDocs,
        limit: result.limit ?? safeLimit,
        page: result.page ?? safePage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default listShipping;
