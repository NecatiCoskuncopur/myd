'use server';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { messages, welcomeMail } from '@/constants';
import connectMongoDB from '@/lib/db';
import MydMail from '@/lib/mailer';
import sendSms from '@/lib/sendSms';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { Balance, User } from '@/models';
import createUserSchema from '@/schemas/createUser.schema';

const { AUTH, GENERAL, USER } = messages;

const signUp = async (data: ISignUpPayload): Promise<IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await createUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await validateRecaptcha(validatedData.recaptchaToken);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return {
        status: 'ERROR',
        message: USER.EXIST,
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const newUser = await User.create({
      ...validatedData,
      password: hashedPassword,
    });

    await Balance.create({ userId: newUser._id });

    try {
      await MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: newUser.email,
        subject: '🎉 Hoşgeldiniz!',
        html: welcomeMail,
      });
    } catch (mailError) {
      Sentry.captureException(mailError);
    }

    if (newUser.phone) {
      try {
        const smsText = `Sayın ${newUser.firstName} ${newUser.lastName}, MYD Export'a hoşgeldiniz! Gönderi oluşturmaya başlayabilirsiniz, detaylar için sizi arayacağız, iyi çalışmalar ve bol kazançlar dileriz.`;

        await sendSms(newUser.phone, smsText);
      } catch (smsError) {
        Sentry.captureException(smsError);
      }
    }

    return {
      status: 'OK',
      message: AUTH.SIGNUP_SUCCESS,
    };
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
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default signUp;
