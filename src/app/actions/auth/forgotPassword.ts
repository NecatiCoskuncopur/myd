'use server';

import jwt from 'jsonwebtoken';

import MydMail from '@/lib/mailer';
import forgotPasswordMail from '@/mailTemplates/forgotPassword.mail';
import { User } from '@/models';

interface ForgotPasswordInput {
  email: string;
}

export const forgotPassword = async (data: ForgotPasswordInput) => {
  try {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı!');
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '15m',
      },
    );

    await MydMail.sendMail({
      from: '"MYD Export" <noreply@mydexport.com>',
      to: user.email,
      subject: 'Parola Sıfırlama Talebiniz',
      html: forgotPasswordMail(`${process.env.FRONT_URL}/kullanici/parolami-unuttum/${token}`),
    });

    return {
      status: 'OK',
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
