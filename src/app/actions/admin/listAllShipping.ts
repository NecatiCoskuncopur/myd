'use server';

import * as Sentry from '@sentry/nextjs';
import json2xls from 'json2xls';
import moment from 'moment';
import { PaginateModel } from 'mongoose';

import { generalMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import { Shipping } from '@/models';
import requireRoles from '@/lib/requireRoles';
import { ShippingTypes } from '@/types/shipping';
import excelColumns from '@/constants/excelColumns';

const { UNEXPECTED_ERROR } = generalMessages;

const listShippingAdmin = async (
  params: ShippingTypes.IListShippingParams & { userId?: string },
): Promise<ResponseTypes.IActionResponse<ShippingTypes.IShippingData | ShippingTypes.IShippingExcel>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    await connectMongoDB();

    const {
      page = 1,
      limit = 5,
      trackingNumber,
      startDate,
      endDate,
      download,
      senderName,
      consigneeName,
      consigneeCompany,
      consigneePhone,
      userId: filteredUserId,
    } = params;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const match: Record<string, unknown> = {};

    if (filteredUserId) {
      match.userId = filteredUserId;
    }

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
      const shipping = await Shipping.find(match)
        .populate('userId', 'name email')
        .select('userId sender consignee content package carrier createdAt')
        .limit(10000)
        .lean();

      const excelData = shipping.map(item => {
        const totalProductValue = item.content?.products?.reduce((prev: number, { piece = 0, unitPrice = 0 }) => prev + piece! * unitPrice!, 0) ?? 0;
        const productNames = item.content?.products?.map(p => p.name).join(', ') ?? '';

        return {
          [excelColumns.senderName]: item.sender?.name || '',
          [excelColumns.senderCompany]: item.sender?.company || '',
          [excelColumns.consigneeName]: item.consignee?.name || '',
          [excelColumns.consigneeAddress]:
            `${item.consignee?.address?.line1 ?? ''} ${item.consignee?.address?.line2 ?? ''} ${item.consignee?.address?.city ?? ''}`.trim(),
          [excelColumns.consigneeCountry]: item.consignee?.address?.country || '',
          [excelColumns.consigneeState]: item.consignee?.address?.state ?? '',
          [excelColumns.consigneePostalCode]: item.consignee?.address?.postalCode || '',
          [excelColumns.trackingNumber]: item.carrier?.trackingNumber ?? '',
          [excelColumns.weight]: item.package?.weight || 0,
          [excelColumns.price]: item.carrier?.amount ?? '',
          [excelColumns.content]: productNames,
          [excelColumns.totalContentValue]: totalProductValue,
          [excelColumns.date]: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD') : '',
        };
      });

      const excelBuffer = json2xls(excelData);
      const base64Content = Buffer.isBuffer(excelBuffer) ? excelBuffer.toString('base64') : Buffer.from(excelBuffer, 'binary').toString('base64');

      return {
        status: 'OK',
        data: {
          fileName: `admin_gonderiler_${moment().format('DD-MM-YYYY')}.xls`,
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
      populate: {
        path: 'userId',
        select: 'name email',
      },
      projection: {
        userId: 1,
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
        shippings: JSON.parse(JSON.stringify(result.docs)),
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
      Sentry.withScope(scope => {
        scope.setTag('action', 'listAllShipping');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default listShippingAdmin;
