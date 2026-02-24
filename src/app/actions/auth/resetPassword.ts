'use server';

import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { env } from '@/lib/env';
import MydMail from '@/lib/mailer';
import { User } from '@/models';
import resetPasswordSchema from '@/schema/resetPassword.schema';

interface ResetTokenPayload extends JwtPayload {
  userId: string;
  type: 'PASSWORD_RESET';
}

const resetPassword = async (data: IResetPasswordPayload): Promise<IActionResponse> => {
  let validatedData: IResetPasswordPayload;

  try {
    validatedData = await resetPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors[0],
      };
    }

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }

  try {
    await connectMongoDB();

    let decoded: ResetTokenPayload;

    try {
      decoded = jwt.verify(validatedData.token, env.JWT_SECRET) as ResetTokenPayload;
    } catch {
      return {
        status: 'ERROR',
        message: messages.AUTH.INVALID_TOKEN,
      };
    }

    if (!decoded.userId || decoded.type !== 'PASSWORD_RESET') {
      return {
        status: 'ERROR',
        message: messages.AUTH.INVALID_TOKEN,
      };
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return {
        status: 'ERROR',
        message: messages.AUTH.INVALID_TOKEN,
      };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, 12);
    await user.save();

    await MydMail.sendMail({
      to: user.email,
      subject: 'Parolanız Sıfırlandı',
      html: 'Parolanız başarıyla sıfırlandı. Eğer bu işlemi siz yapmadıysanız hemen bizimle iletişime geçin.',
    });

    return { status: 'OK' };
  } catch (error) {
    console.error('Reset Password Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default resetPassword;
