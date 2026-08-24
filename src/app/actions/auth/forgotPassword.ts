'use server';

import jwt from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { forgotPasswordMail, generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import MydMail from '@/lib/mailer';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { User } from '@/models';
import forgotPasswordSchema from '@/schemas/forgotPassword.schema';

const forgotPassword = async (data: AuthTypes.IForgotPasswordPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await forgotPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const captchaResult = await validateRecaptcha(validatedData.recaptchaToken);

    if (!captchaResult.success) {
      return {
        status: 'ERROR',
        message: captchaResult.message,
      };
    }

    await connectMongoDB();

    const user = await User.findOne({
      email: validatedData.email.trim().toLowerCase(),
    }).select('_id email +password');

    if (!user) {
      return {
        status: 'OK',
      };
    }

    const secret = `${env.PASSWORD_RESET_SECRET}:${user.password}`;

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        type: 'PASSWORD_RESET',
      },
      secret,
      {
        algorithm: 'HS256',
        expiresIn: '15m',
      },
    );

    try {
      await MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: user.email,
        subject: 'Parola Sıfırlama Talebiniz',
        html: forgotPasswordMail(`${env.FRONT_URL}/kullanici/parolami-unuttum/${token}`),
      });
    } catch (mailError) {
      captureActionError('forgotPassword.sendMail', mailError, {
        extras: {
          userId: user._id.toString(),
        },
      });
    }

    return {
      status: 'OK',
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('forgotPassword', error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default forgotPassword;
