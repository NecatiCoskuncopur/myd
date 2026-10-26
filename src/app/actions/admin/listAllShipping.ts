'use server';

import json2xls from 'json2xls';
import moment from 'moment';
import { PaginateModel } from 'mongoose';

import { escapeRegex, excelColumns, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { Shipping } from '@/models';
import { ShippingTypes } from '@/types/shipping';

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
      limit = 10,
      trackingNumber,
      startDate,
      endDate,
      download,
      senderName,
      senderCompany,
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
      $regex: `^${escapeRegex(val)}`,
      $options: 'i',
    });

    if (trackingNumber) match['carrier.trackingNumber'] = createRegex(trackingNumber);
    if (senderName) match['sender.name'] = createRegex(senderName);
    if (senderCompany) match['sender.company'] = createRegex(senderCompany);
    if (consigneeName) match['consignee.name'] = createRegex(consigneeName);
    if (consigneeCompany) match['consignee.company'] = createRegex(consigneeCompany);
    if (consigneePhone) match['consignee.phone'] = createRegex(consigneePhone);

    const carrierFields = [
      'carrier.name',
      'carrier.displayName',
      'carrier.accountType',
      'carrier.account',
      'carrier.carrierShipmentId',
      'carrier.trackingNumber',
      'carrier.amount',
      'carrier.cost',
      'carrier.insuranceCost',
      'carrier.dutiesAndTaxesCost',
      'carrier.longSideSurchargeCost',
      'carrier.serviceFee',
    ].join(' ');

    if (download) {
      const shipping = await Shipping.find(match)
        .populate('userId', 'name email')
        .select(`userId sender consignee content package status trackStatus createdAt ${carrierFields}`)
        .limit(10000)
        .lean();

      const excelData = shipping.map(item => {
        const totalProductValue = item.content?.products?.reduce((prev: number, { piece = 0, unitPrice = 0 }) => prev + piece! * unitPrice!, 0) ?? 0;
        const productNames = item.content?.products?.map(p => p.name).join(', ') ?? '';

        const baseAmount = Number(item.carrier?.amount) || 0;
        const insuranceAmount = Number(item.carrier?.insuranceCost) || 0;
        const taxAmount = Number(item.carrier?.dutiesAndTaxesCost) || 0;
        const serviceFee = Number(item.carrier?.serviceFee) || 0;
        const longSideCost = Number(item.carrier?.longSideSurchargeCost) || 0;
        const totalShippingCost = baseAmount + insuranceAmount + taxAmount + serviceFee + longSideCost;

        return {
          [excelColumns.senderName]: item.sender?.name || '',
          [excelColumns.senderCompany]: item.sender?.company || '',
          [excelColumns.consigneeName]: item.consignee?.name || '',
          [excelColumns.consigneeCountry]: item.consignee?.address?.country || '',
          [excelColumns.trackingNumber]: item.carrier?.trackingNumber ?? '',
          [excelColumns.weight]: item.package?.weight || 0,
          [excelColumns.content]: productNames,
          [excelColumns.totalContentValue]: totalProductValue,
          [excelColumns.accountType]: item.carrier?.accountType || '',
          [excelColumns.totalShippingCost]: totalShippingCost || '',
          [excelColumns.price]: baseAmount || '',
          [excelColumns.insuranceAmount]: insuranceAmount || '',
          [excelColumns.taxAmount]: taxAmount || '',
          [excelColumns.serviceFee]: serviceFee || '',
          [excelColumns.longSideCost]: longSideCost || '',
          [excelColumns.date]: item.createdAt ? moment(item.createdAt).format('YYYY-MM-DD') : '',
          [excelColumns.status]: item.status === 'CANCELLED' ? 'İPTAL' : '',
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
        sender: { name: 1, company: 1 },
        consignee: {
          name: 1,
          address: { country: 1, state: 1, city: 1 },
        },
        content: { currency: 1, products: 1, insuranceAmount: 1, customsTaxAmount: 1, serviceFee: 1 },
        package: 1,
        packageDimensionsUpdated: 1,
        carrier: 1,
        status: 1,
        trackStatus: 1,
        labeledAt: 1,
        createdAt: 1,
      },
    });

    return {
      status: 'OK',
      data: {
        shippings: serialize<ShippingTypes.IShipping[]>(result.docs),
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
      captureActionError('listAllShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default listShippingAdmin;
