'use server';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { authMessages, generalMessages, pricingListMessages, userMessages, welcomeMail } from '@/constants';
import connectMongoDB from '@/lib/db';
import MydMail from '@/lib/mailer';
import sendSms from '@/lib/sendSms';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { Balance, User, PricingList } from '@/models';
import createUserSchema from '@/schemas/createUser.schema';

const signUp = async (data: AuthTypes.ISignUpPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await createUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    await connectMongoDB();

    const captchaResult = await validateRecaptcha(validatedData.recaptchaToken);
    if (!captchaResult.success) {
      return { status: 'ERROR', message: captchaResult.message };
    }

    const emailLower = validatedData.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return {
        status: 'ERROR',
        message: userMessages.EXIST,
      };
    }

    const defaultPricingList = await PricingList.findOne({ isDefault: true });
    if (!defaultPricingList) {
      return {
        status: 'ERROR',
        message: pricingListMessages.DEFAULT_UNDEFINED,
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const newUser = await User.create({
      ...validatedData,
      email: emailLower,
      password: hashedPassword,
      priceListId: defaultPricingList._id,
    });

    try {
      await Balance.create({ userId: newUser._id, total: 0 });
    } catch (balanceError) {
      Sentry.captureException(balanceError, {
        extra: { userId: newUser._id, context: 'SignUp - Balance Creation Failed' },
      });

      await User.findByIdAndDelete(newUser._id);

      return {
        status: 'ERROR',
        message: authMessages.SIGNUP.ERROR,
      };
    }

    void MydMail.sendMail({
      from: '"MYD Export" <noreply@mydexport.com>',
      to: newUser.email,
      subject: '🎉 Hoşgeldiniz!',
      html: welcomeMail,
    }).catch(error => {
      Sentry.withScope(scope => {
        scope.setTag('action', 'signUp');
        scope.setExtra('email', newUser.email);
        Sentry.captureException(error);
      });
    });

    const smsText = `Sayın ${newUser.firstName} ${newUser.lastName}, MYD Export'a hoşgeldiniz! Gönderi oluşturmaya başlayabilirsiniz, detaylar için sizi arayacağız, iyi çalışmalar ve bol kazançlar dileriz.`;
    if (!newUser.phone) {
      void sendSms(newUser.phone, smsText).catch(error => {
        Sentry.withScope(scope => {
          scope.setTag('action', 'signUp');
          scope.setExtra('phone', newUser.phone);
          Sentry.captureException(error);
        });
      });
    }
    return {
      status: 'OK',
      message: authMessages.SIGNUP.SUCCESS,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'signUp');
        scope.captureException(error);
      });
    }
    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default signUp;
