'use server';

import * as Sentry from '@sentry/nextjs';
import json2xls from 'json2xls';
import moment from 'moment';
import { PaginateModel } from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { GENERAL } = messages;

const listShipping = async (params: IListShippingParams): Promise<IActionResponse<IShippingData | IShippingExcel>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    const { page = 1, limit = 5, trackingNumber, startDate, endDate, download } = params;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    let dateQuery;

    if (startDate && endDate) {
      dateQuery = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate(),
      };
    }

    const match: Record<string, unknown> = {
      userId: currentUser.id,
    };

    if (trackingNumber) {
      const escapedTracking = trackingNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      match['carrier.trackingNumber'] = {
        $regex: escapedTracking,
        $options: 'i',
      };
    }

    if (dateQuery) {
      match.createdAt = dateQuery;
    }

    const isDownload = Boolean(download);

    if (isDownload) {
      const shipping = await Shipping.find(match).select('sender consignee content package carrier createdAt').limit(10000).lean<IShipping[]>();

      const excelData = shipping.map(item => {
        const totalProductValue = item.content?.products?.reduce((prev, { piece = 0, unitPrice = 0 }) => prev + piece * unitPrice, 0) ?? 0;

        const productNames = item.content?.products?.map(p => p.name).join(', ') ?? '';

        return {
          'Gönderici Adı': item.sender?.name,
          'Gönderici Firma': item.sender?.company,
          'Alıcı Adı': item.consignee?.name,
          'Alıcı Adres': `${item.consignee?.address?.line1 ?? ''} ${item.consignee?.address?.line2 ?? ''} ${item.consignee?.address?.city ?? ''}`,
          'Alıcı Ülke': item.consignee?.address?.country,
          'Alıcı Eyalet': item.consignee?.address?.state ?? '',
          'Alıcı Posta Kodu': item.consignee?.address?.postalCode,
          'Takip Kodu': item.carrier?.trackingNumber ?? '',
          Desi: item.package?.weight,
          Tutar: item.carrier?.amount ?? '',
          İçerik: productNames,
          'İçerik Toplam Tutarı': totalProductValue,
          Tarih: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : '',
        };
      });

      return {
        status: 'OK',
        data: {
          fileName: 'shipping_export.xls',
          content: Buffer.from(json2xls(excelData)).toString('base64'),
        },
      };
    }

    const shippingModel = Shipping as typeof Shipping & PaginateModel<IShipping>;

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

    return {
      status: 'OK',
      data: {
        shippings: result.docs,
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
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default listShipping;
