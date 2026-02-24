'use server';

import jwt from 'jsonwebtoken';

import { forgotPasswordMail, messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { env } from '@/lib/env';
import MydMail from '@/lib/mailer';
import { User } from '@/models';

const forgotPassword = async (data: IForgotPasswordPayload): Promise<IActionResponse> => {
  try {
    await connectMongoDB();

    const user = await User.findOne({ email: data.email });

    if (!user) return { status: 'OK' };

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        type: 'PASSWORD_RESET',
      },
      env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    await MydMail.sendMail({
      from: '"MYD Export" <noreply@mydexport.com>',
      to: user.email,
      subject: 'Parola Sıfırlama Talebiniz',
      html: forgotPasswordMail(`${env.FRONT_URL}/kullanici/parolami-unuttum/${token}`),
    });

    return { status: 'OK' };
  } catch (error) {
    console.error('Forgot Password Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default forgotPassword;
