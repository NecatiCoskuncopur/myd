'use server';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { authMessages, generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import MydMail from '@/lib/mailer';
import { User } from '@/models';
import resetPasswordSchema from '@/schemas/resetPassword.schema';

const { INVALID_TOKEN, RESETPASSWORD } = authMessages;

interface ResetTokenPayload extends JwtPayload {
  userId: string;
  type: 'PASSWORD_RESET';
}

const resetPassword = async (data: AuthTypes.IResetPasswordPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await resetPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const decoded = jwt.verify(validatedData.token, env.JWT_SECRET) as ResetTokenPayload;

    if (!decoded.userId || decoded.type !== 'PASSWORD_RESET') {
      return {
        status: 'ERROR',
        message: INVALID_TOKEN,
      };
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return {
        status: 'ERROR',
        message: INVALID_TOKEN,
      };
    }

    const dynamicSecret = env.JWT_SECRET + user.password.slice(-10);

    try {
      jwt.verify(validatedData.token, dynamicSecret);
    } catch (verifyError) {
      if (verifyError instanceof jwt.TokenExpiredError) {
        return { status: 'ERROR', message: RESETPASSWORD.EXPIRED };
      }

      Sentry.captureException(verifyError);
      return { status: 'ERROR', message: INVALID_TOKEN };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, 12);
    await user.save();

    try {
      await MydMail.sendMail({
        to: user.email,
        subject: 'Parolanız Sıfırlandı',
        html: 'Parolanız başarıyla sıfırlandı. Eğer bu işlemi siz yapmadıysanız hemen bizimle iletişime geçin.',
      });
    } catch (mailError) {
      Sentry.captureException(mailError);
    }

    return { status: 'OK', message: RESETPASSWORD.SUCCESS };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default resetPassword;
