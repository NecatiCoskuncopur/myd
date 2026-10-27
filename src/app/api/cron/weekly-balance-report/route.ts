import { NextResponse } from 'next/server';
import moment from 'moment';
import { Types } from 'mongoose';
import * as XLSX from 'xlsx';

import { excelColumns } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import getMailTransport from '@/lib/mailer';
import { Shipping, Transaction } from '@/models';

export const maxDuration = 60;

interface IUserPopulated {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface IProductItem {
  name?: string;
  piece?: number;
  unitPrice?: number;
}

interface IShippingPopulated {
  _id: Types.ObjectId;
  status: string;
  trackingNumber?: string;
  createdAt?: Date;
  sender?: {
    name?: string;
    company?: string;
  };
  consignee?: {
    name?: string;
    address?: {
      country?: string;
    };
  };
  package?: {
    weight?: number;
  };
  content?: {
    products?: IProductItem[];
  };
  carrier?: {
    amount?: number;
    insuranceCost?: number;
    dutiesAndTaxesCost?: number;
    serviceFee?: number;
    longSideSurchargeCost?: number;
    accountType?: string;
    trackingNumber?: string;
  };
}

interface ITransactionPopulated {
  _id: Types.ObjectId;
  userId: IUserPopulated | Types.ObjectId | null;
  amount: number;
  createdAt: Date;
  transactionType: 'SPEND' | 'PAY';
  shippingId?: IShippingPopulated | Types.ObjectId | null;
}

interface IUserGroup {
  user: IUserPopulated;
  transactions: ITransactionPopulated[];
}

const isPopulatedUser = (user: unknown): user is IUserPopulated => {
  return typeof user === 'object' && user !== null && 'email' in user;
};

const isPopulatedShipping = (shipping: unknown): shipping is IShippingPopulated => {
  return typeof shipping === 'object' && shipping !== null && 'status' in shipping;
};

type ExcelRowItem = Record<string, string | number>;

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectMongoDB();

    const endOfRange = moment().startOf('day');
    const startOfRange = moment(endOfRange).subtract(7, 'days');

    const rawTransactions = await Transaction.find({
      createdAt: {
        $gte: startOfRange.toDate(),
        $lt: endOfRange.toDate(),
      },
      transactionType: 'SPEND',
    })
      .populate<{ userId: IUserPopulated | null }>({
        path: 'userId',
        select: 'firstName lastName email',
      })
      .populate<{ shippingId: IShippingPopulated | null }>({
        path: 'shippingId',
        model: Shipping,
        select: '_id status trackingNumber carrier sender consignee package content createdAt',
      })
      .sort({ createdAt: -1 })
      .lean<ITransactionPopulated[]>();

    const validTransactions = rawTransactions.filter(t => {
      if (isPopulatedShipping(t.shippingId)) {
        return t.shippingId.status !== 'CANCELLED';
      }
      return true;
    });

    if (validTransactions.length === 0) {
      return NextResponse.json({ message: 'Bu hafta için geçerli harcama işlemi bulunamadı.' }, { status: 200 });
    }

    const userGroups = new Map<string, IUserGroup>();

    for (const transaction of validTransactions) {
      if (!isPopulatedUser(transaction.userId) || !transaction.userId.email) {
        continue;
      }

      const userIdKey = String(transaction.userId._id);

      if (!userGroups.has(userIdKey)) {
        userGroups.set(userIdKey, {
          user: transaction.userId,
          transactions: [],
        });
      }

      userGroups.get(userIdKey)!.transactions.push(transaction);
    }

    if (userGroups.size === 0) {
      return NextResponse.json({ message: 'Geçerli e-postaya sahip kullanıcı bulunamadı.' }, { status: 200 });
    }

    const transporter = await getMailTransport();
    const senderEmail = (transporter.options as { auth?: { user?: string } })?.auth?.user || 'destek@sirketiniz.com';

    const displayEndDate = moment(endOfRange).subtract(1, 'day');
    const dateRangeStr = `${startOfRange.format('DD.MM.YYYY')} - ${displayEndDate.format('DD.MM.YYYY')}`;

    const userList = Array.from(userGroups.values());
    let sentCount = 0;
    const failedEmails: string[] = [];

    const sendMailForUser = async ({ user, transactions }: IUserGroup) => {
      const excelRows: ExcelRowItem[] = transactions.map(t => {
        const shipping = isPopulatedShipping(t.shippingId) ? t.shippingId : null;
        const carrier = shipping?.carrier;

        const totalProductValue = shipping?.content?.products?.reduce((prev, { piece = 0, unitPrice = 0 }) => prev + piece * unitPrice, 0) ?? 0;
        const productNames =
          shipping?.content?.products
            ?.map(p => p.name)
            .filter(Boolean)
            .join(', ') ?? '';

        const baseAmount = Number(carrier?.amount) || 0;
        const insuranceAmount = Number(carrier?.insuranceCost) || 0;
        const taxAmount = Number(carrier?.dutiesAndTaxesCost) || 0;
        const serviceFee = Number(carrier?.serviceFee) || 0;
        const longSideCost = Number(carrier?.longSideSurchargeCost) || 0;
        const totalShippingCost = baseAmount + insuranceAmount + taxAmount + serviceFee + longSideCost;

        return {
          [excelColumns.date]: shipping?.createdAt ? moment(shipping.createdAt).format('YYYY-MM-DD') : '',
          [excelColumns.senderName]: shipping?.sender?.name || '',
          [excelColumns.senderCompany]: shipping?.sender?.company || '',
          [excelColumns.consigneeName]: shipping?.consignee?.name || '',
          [excelColumns.consigneeCountry]: shipping?.consignee?.address?.country || '',
          [excelColumns.trackingNumber]: carrier?.trackingNumber || '',
          [excelColumns.weight]: shipping?.package?.weight ?? 0,
          [excelColumns.content]: productNames,
          [excelColumns.totalContentValue]: totalProductValue,
          [excelColumns.accountType]: carrier?.accountType || '',
          [excelColumns.price]: baseAmount,
          [excelColumns.insuranceAmount]: insuranceAmount,
          [excelColumns.taxAmount]: taxAmount,
          [excelColumns.serviceFee]: serviceFee,
          [excelColumns.longSideCost]: longSideCost,
          [excelColumns.totalShippingCost]: totalShippingCost,
        };
      });

      const totalAmountSpent = transactions.reduce((acc, cur) => acc + (cur.amount || 0), 0);

      excelRows.push({
        [excelColumns.date]: '',
        [excelColumns.senderName]: '',
        [excelColumns.senderCompany]: '',
        [excelColumns.consigneeName]: '',
        [excelColumns.consigneeCountry]: '',
        [excelColumns.trackingNumber]: '',
        [excelColumns.weight]: '',
        [excelColumns.content]: '',
        [excelColumns.totalContentValue]: '',
        [excelColumns.accountType]: '',
        [excelColumns.price]: '',
        [excelColumns.insuranceAmount]: '',
        [excelColumns.taxAmount]: '',
        [excelColumns.serviceFee]: '',
        [excelColumns.longSideCost]: 'TOPLAM',
        [excelColumns.totalShippingCost]: Number(totalAmountSpent.toFixed(2)),
      });

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Harcama_Ekstresi');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Değerli Müşterimiz';
      const fileName = `Harcama_Ekstresi_${startOfRange.format('DD_MM_YYYY')}_${displayEndDate.format('DD_MM_YYYY')}.xlsx`;

      await transporter.sendMail({
        from: `"Finans & Muhasebe" <${senderEmail}>`,
        to: user.email,
        subject: `Haftalık Harcama Ekstreniz (${dateRangeStr})`,
        text: `Merhaba ${fullName},\n\n${dateRangeStr} tarihleri arasında hesabınızdan gerçekleşen toplam ${totalAmountSpent.toFixed(2)}$ tutarındaki harcamalarınıza ait detaylı ekstre ekte yer almaktadır.\n\nİyi çalışmalar dileriz.`,
        attachments: [
          {
            filename: fileName,
            content: excelBuffer,
          },
        ],
      });
    };

    const BATCH_SIZE = 5;
    const userBatches = chunkArray(userList, BATCH_SIZE);

    for (const batch of userBatches) {
      const results = await Promise.allSettled(batch.map(item => sendMailForUser(item)));

      results.forEach((res, index) => {
        const currentUser = batch[index].user;
        if (res.status === 'fulfilled') {
          sentCount++;
        } else {
          failedEmails.push(currentUser.email);
          captureActionError('cron.weeklyBalanceReport.userMailFailed', res.reason, {
            extras: {
              userId: String(currentUser._id),
              email: currentUser.email,
            },
          });
        }
      });
    }

    return NextResponse.json(
      {
        status: 'ok',
        dateRange: dateRangeStr,
        totalUsersFound: userGroups.size,
        sentCount,
        failedCount: failedEmails.length,
        failedEmails,
      },
      { status: 200 },
    );
  } catch (error) {
    captureActionError('cron.weeklyBalanceReport.batch', error);

    const errorMessage = error instanceof Error ? error.message : 'İşlem sırasında beklenmeyen bir hata oluştu.';

    return NextResponse.json(
      {
        status: 'error',
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
