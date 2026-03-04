'use server';

import jwt from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { forgotPasswordMail, messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import MydMail from '@/lib/mailer';
import { User } from '@/models';
import forgotPasswordSchema from '@/schemas/forgotPassword.schema';

const { GENERAL } = messages;

const forgotPassword = async (data: IForgotPasswordPayload): Promise<IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await forgotPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const user = await User.findOne({ email: validatedData.email });

    if (!user) return { status: 'OK' };

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        type: 'PASSWORD_RESET',
      },
      env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    try {
      await MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: user.email,
        subject: 'Parola Sıfırlama Talebiniz',
        html: forgotPasswordMail(`${env.FRONT_URL}/kullanici/parolami-unuttum/${token}`),
      });
    } catch (mailError) {
      console.error('Welcome mail error:', mailError);
    }

    return { status: 'OK' };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default forgotPassword;
