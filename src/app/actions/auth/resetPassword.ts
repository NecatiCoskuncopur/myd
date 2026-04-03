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
  sub: string;
  type: 'PASSWORD_RESET';
}

const resetPassword = async (data: AuthTypes.IResetPasswordPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await resetPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const decoded = jwt.decode(validatedData.token) as ResetTokenPayload;

    if (!decoded || !decoded.sub || decoded.type !== 'PASSWORD_RESET') {
      return { status: 'ERROR', message: INVALID_TOKEN };
    }

    const user = await User.findById(decoded.sub).select('+password');

    if (!user) {
      return { status: 'ERROR', message: INVALID_TOKEN };
    }

    const dynamicSecret = env.JWT_SECRET + user.password.slice(-10);

    try {
      jwt.verify(validatedData.token, dynamicSecret);
    } catch (verifyError) {
      if (verifyError instanceof jwt.TokenExpiredError) {
        return { status: 'ERROR', message: RESETPASSWORD.EXPIRED };
      }
      return { status: 'ERROR', message: INVALID_TOKEN };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, 12);
    await user.save();

    try {
      await MydMail.sendMail({
        to: user.email,
        subject: 'Parolanız Sıfırlandı',
        html: 'Parolanız başarıyla sıfırlandı. Bu işlemi siz yapmadıysanız iletişime geçin.',
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
