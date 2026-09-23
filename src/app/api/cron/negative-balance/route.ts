import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import connectMongoDB from '@/lib/db';
import sendSms from '@/lib/sendSms';
import { User } from '@/models';

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

    const indebtedUsers = await User.find({
      balance: {
        $lt: 0,
      },
      isActive: true,
    })
      .select('_id firstName lastName phone balance')
      .lean();

    let sentCount = 0;
    let failedCount = 0;
    let missingPhoneCount = 0;

    for (const user of indebtedUsers) {
      if (!user.phone) {
        missingPhoneCount += 1;
        continue;
      }

      const debt = Math.abs(user.balance);

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
            phone: user.phone,
          });

          scope.setContext('balance', {
            balance: user.balance,
            debt,
          });

          Sentry.captureException(error);
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalCount: indebtedUsers.length,
      sentCount,
      failedCount,
      missingPhoneCount,
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
