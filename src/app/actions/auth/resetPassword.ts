'use server';

import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ValidationError } from 'yup';

import { authMessages, BCRYPT_SALT_ROUNDS, generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import MydMail from '@/lib/mailer';
import { User } from '@/models';
import resetPasswordSchema from '@/schemas/resetPassword.schema';

const { INVALID_TOKEN, RESETPASSWORD } = authMessages;

const resetPassword = async (data: AuthTypes.IResetPasswordPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await resetPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const decoded = jwt.decode(validatedData.token);

    if (
      !decoded ||
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      decoded.type !== 'PASSWORD_RESET' ||
      !Types.ObjectId.isValid(decoded.sub)
    ) {
      return {
        status: 'ERROR',
        message: INVALID_TOKEN,
      };
    }

    await connectMongoDB();

    const user = await User.findById(decoded.sub).select('_id email +password');

    if (!user) {
      return {
        status: 'ERROR',
        message: INVALID_TOKEN,
      };
    }

    const dynamicSecret = `${env.PASSWORD_RESET_SECRET}:${user.password}`;

    let verifiedToken: string | JwtPayload;

    try {
      verifiedToken = jwt.verify(validatedData.token, dynamicSecret, {
        algorithms: ['HS256'],
      });
    } catch (verifyError) {
      if (verifyError instanceof jwt.TokenExpiredError) {
        return {
          status: 'ERROR',
          message: RESETPASSWORD.EXPIRED,
        };
      }

      return {
        status: 'ERROR',
        message: INVALID_TOKEN,
      };
    }

    if (typeof verifiedToken === 'string' || verifiedToken.sub !== decoded.sub || verifiedToken.type !== 'PASSWORD_RESET') {
      return {
        status: 'ERROR',
        message: INVALID_TOKEN,
      };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, BCRYPT_SALT_ROUNDS);

    await user.save();

    try {
      await MydMail.sendMail({
        to: user.email,
        subject: 'Parolanız Sıfırlandı',
        html: 'Parolanız başarıyla sıfırlandı. Bu işlemi siz yapmadıysanız iletişime geçin.',
      });
    } catch (mailError) {
      captureActionError('resetPassword.sendMail', mailError, {
        extras: {
          userId: user._id.toString(),
        },
      });
    }

    return {
      status: 'OK',
      message: RESETPASSWORD.SUCCESS,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('resetPassword', error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default resetPassword;
