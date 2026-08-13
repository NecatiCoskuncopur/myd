import { NextResponse } from 'next/server';
import { Balance, User } from '@/models';

import connectMongoDB from '@/lib/db';
import sendSms from '@/lib/sendSms';

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

  await connectMongoDB();

  const balances = await Balance.find({
    total: { $lt: 0 },
  });

  for (const balance of balances) {
    const user = await User.findById(balance.userId);

    if (!user) continue;

    const message = `
Sayın ${user.firstName}, MYD Export hesabınızda ${Math.abs(balance.total)} USD tutarında ödenmemiş borç bulunmaktadır. Hizmetlerimizin kesintisiz devam edebilmesi için ödemenizi gerçekleştirmenizi rica ederiz. MYD Export
`;
    await sendSms(user.phone, message);
  }

  return NextResponse.json({
    success: true,
    count: balances.length,
  });
}
