'use server';

import json2xls from 'json2xls';
import moment from 'moment';
import { PaginateModel } from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { Shipping } from '@/models';

const { GENERAL } = messages;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const listAllShipping = async (params: IListShippingParams): Promise<IActionResponse<IShippingData | IShippingExcel>> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, senderName, consigneeName, consigneeCompany, consigneePhone, trackingNumber, download, startDate, endDate } = params;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    let dateQuery;

    if (startDate && endDate) {
      dateQuery = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate(),
      };
    }

    const match: IShippingMatch = {};

    if (senderName) match['sender.name'] = { $regex: escapeRegex(senderName), $options: 'i' };

    if (consigneeName)
      match['consignee.name'] = {
        $regex: escapeRegex(consigneeName),
        $options: 'i',
      };

    if (consigneeCompany)
      match['consignee.company'] = {
        $regex: escapeRegex(consigneeCompany),
        $options: 'i',
      };

    if (consigneePhone)
      match['consignee.phone'] = {
        $regex: escapeRegex(consigneePhone),
        $options: 'i',
      };

    if (trackingNumber)
      match['carrier.trackingNumber'] = {
        $regex: escapeRegex(trackingNumber),
        $options: 'i',
      };

    if (dateQuery) match.createdAt = dateQuery;

    if (download) {
      const shipping = await Shipping.find(match).limit(10000).lean<IShipping[]>();

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
          Tarih: moment(item.createdAt).format('YYYY-MM-DD'),
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
        'sender.name': 1,
        'consignee.name': 1,
        'consignee.address.country': 1,
        'consignee.address.state': 1,
        'consignee.address.city': 1,
        content: 1,
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
        limit: result.limit,
        page: result.page ?? safePage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    };
  } catch {
    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default listAllShipping;
