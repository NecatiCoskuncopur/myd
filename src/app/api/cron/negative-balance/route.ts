import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import connectMongoDB from '@/lib/db';
import sendSms from '@/lib/sendSms';
import { Balance, User } from '@/models';

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
      total: {
        $lt: 0,
      },
    })
      .select('_id userId total')
      .lean();

    const userIds = balances.map(balance => balance.userId);

    const users = await User.find({
      _id: {
        $in: userIds,
      },
    })
      .select('_id firstName lastName phone')
      .lean();

    const userMap = new Map(users.map(user => [user._id.toString(), user]));

    let sentCount = 0;
    let failedCount = 0;
    let missingUserCount = 0;

    for (const balance of balances) {
      const userId = balance.userId.toString();
      const user = userMap.get(userId);

      if (!user) {
        missingUserCount += 1;

        Sentry.captureMessage('Balance için kullanıcı bulunamadı', {
          level: 'warning',
          extra: {
            balanceId: balance._id.toString(),
            userId,
            balanceTotal: balance.total,
          },
        });
      } else {
        const debt = Math.abs(balance.total);

        const message =
          `Sayın ${user.firstName}, ` +
          `MYD Export hesabınızda ${debt} USD tutarında ` +
          `ödenmemiş borç bulunmaktadır. ` +
          `Hizmetlerimizin kesintisiz devam edebilmesi için ` +
          `ödemenizi gerçekleştirmenizi rica ederiz. MYD Export`;

        try {
          await sendSms(user.phone, message);
          sentCount += 1;
        } catch (error) {
          failedCount += 1;

          Sentry.withScope(scope => {
            scope.setLevel('error');
            scope.setTag('error_type', 'balance_debt_sms');
            scope.setTag('user_id', user._id.toString());

            scope.setContext('user', {
              id: user._id.toString(),
              firstName: user.firstName,
              lastName: user.lastName,
            });

            scope.setContext('balance', {
              balanceId: balance._id.toString(),
              total: balance.total,
              debt,
            });

            Sentry.captureException(error);
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: balances.length,
      sentCount,
      failedCount,
      missingUserCount,
    });
  } catch (error) {
    Sentry.withScope(scope => {
      scope.setTag('action', 'balanceDebtSmsCron');

      Sentry.captureException(error);
    });

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
