'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { authMessages, BCRYPT_SALT_ROUNDS, captchaMessages, generalMessages, userMessages, welcomeMail } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import MydMail from '@/lib/mailer';
import sendSms from '@/lib/sendSms';
import { validateTurnstile } from '@/lib/validateTurnstile';
import { Balance, User } from '@/models';
import createUserSchema from '@/schemas/createUser.schema';

const signUp = async (data: AuthTypes.ISignUpPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await createUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const isCaptchaValid = await validateTurnstile(validatedData.recaptchaToken);

    if (!isCaptchaValid) {
      return {
        status: 'ERROR',
        message: captchaMessages.INVALID,
      };
    }

    await connectMongoDB();

    const { recaptchaToken: _recaptchaToken, password, ...userData } = validatedData;

    const email = userData.email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email,
    })
      .select('_id')
      .lean();

    if (existingUser) {
      return {
        status: 'ERROR',
        message: userMessages.EXIST,
      };
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({
      ...userData,
      email,
      password: hashedPassword,
    });

    try {
      await Balance.create({
        userId: newUser._id,
        total: 0,
      });
    } catch (balanceError) {
      captureActionError('signUp.createBalance', balanceError, {
        extras: {
          userId: newUser._id.toString(),
        },
      });

      await User.findByIdAndDelete(newUser._id);

      return {
        status: 'ERROR',
        message: authMessages.SIGNUP.ERROR,
      };
    }

    const smsText =
      `Sayın ${newUser.firstName} ${newUser.lastName}, ` +
      `MYD Export'a hoşgeldiniz! Gönderi oluşturmaya başlayabilirsiniz, ` +
      `detaylar için sizi arayacağız, iyi çalışmalar ve bol kazançlar dileriz.`;

    const notificationTasks: Promise<unknown>[] = [
      MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: newUser.email,
        subject: '🎉 Hoşgeldiniz!',
        html: welcomeMail,
      }),
    ];

    if (newUser.phone) {
      notificationTasks.push(sendSms(newUser.phone, smsText));
    }

    const notificationResults = await Promise.allSettled(notificationTasks);

    const [mailResult, smsResult] = notificationResults;

    if (mailResult.status === 'rejected') {
      captureActionError('signUp.sendMail', mailResult.reason, {
        extras: {
          userId: newUser._id.toString(),
        },
      });
    }

    if (smsResult?.status === 'rejected') {
      captureActionError('signUp.sendSms', smsResult.reason, {
        extras: {
          userId: newUser._id.toString(),
        },
      });
    }

    return {
      status: 'OK',
      message: authMessages.SIGNUP.SUCCESS,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: userMessages.EXIST,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('signUp', error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default signUp;
