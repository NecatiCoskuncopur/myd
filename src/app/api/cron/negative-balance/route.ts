import { NextResponse } from 'next/server';
import { Balance, User } from '@/models';

import connectMongoDB from '@/lib/db';
import sendSms from '@/lib/sendSms';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: Request) {
  const secret = req.headers.get('x-cron-secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      {
        message: 'Unauthorized',
      },
      {
        status: 401,
      },
    );
  }

  try {
    await connectMongoDB();

    const balances = await Balance.find({
      total: { $lt: 0 },
    });

    for (const balance of balances) {
      const user = await User.findById(balance.userId);

      if (!user) {
        Sentry.captureMessage('Balance için kullanıcı bulunamadı', {
          level: 'warning',
          extra: {
            balanceId: balance._id?.toString(),
            userId: balance.userId?.toString(),
            balanceTotal: balance.total,
          },
        });

        continue;
      }

      const message = `
Sayın ${user.firstName}, MYD Export hesabınızda ${Math.abs(balance.total)} USD tutarında ödenmemiş borç bulunmaktadır. Hizmetlerimizin kesintisiz devam edebilmesi için ödemenizi gerçekleştirmenizi rica ederiz. MYD Export
`;

      try {
        await sendSms(user.phone, message);
      } catch (error) {
        Sentry.withScope(scope => {
          scope.setLevel('error');
          scope.setTag('error_type', 'balance_debt_sms');
          scope.setTag('user_id', user._id.toString());

          scope.setContext('user', {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          });

          scope.setContext('balance', {
            balanceId: balance._id?.toString(),
            total: balance.total,
            debt: Math.abs(balance.total),
          });

          scope.setExtra('sms_message', message);

          Sentry.captureException(error);
        });
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      count: balances.length,
    });
  } catch (error) {
    Sentry.captureException(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      {
        status: 500,
      },
    );
  }
}
