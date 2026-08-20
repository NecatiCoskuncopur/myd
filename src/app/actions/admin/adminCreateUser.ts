'use server';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { authMessages, generalMessages, userMessages, UserRole, welcomeMail } from '@/constants';
import connectMongoDB from '@/lib/db';
import MydMail from '@/lib/mailer';
import requireRoles from '@/lib/requireRoles';
import sendSms from '@/lib/sendSms';
import { Balance, User } from '@/models';
import adminCreateUserSchema from '@/schemas/adminCreateUser.schema';
import { AdminTypes } from '@/types/admin';

const adminCreateUser = async (data: AdminTypes.ICreateUser): Promise<ResponseTypes.IActionResponse<AdminTypes.ISearchSenderResult>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    const validatedData = await adminCreateUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      return {
        status: 'ERROR',
        message: userMessages.EXIST,
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const newUser = await User.create({
      ...validatedData,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
    });

    await Balance.create({ userId: newUser._id, total: 0 });

    try {
      void MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: newUser.email,
        subject: '🎉 Hesabınız Oluşturuldu!',
        html: welcomeMail,
      });
    } catch (mailError) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'adminCreateUser');
        scope.setExtra('email', newUser.email);
        Sentry.captureException(mailError);
      });
    }

    if (newUser.phone) {
      try {
        const smsText = `Sayın ${newUser.firstName} ${newUser.lastName}, MYD Export kaydınız admin tarafından tamamlanmıştır. Sisteme giriş yapabilirsiniz.`;
        void sendSms(newUser.phone, smsText);
      } catch (smsError) {
        Sentry.withScope(scope => {
          scope.setTag('action', 'adminCreateUser');
          scope.setExtra('phone', newUser.phone);
          Sentry.captureException(smsError);
        });
      }
    }

    return {
      status: 'OK',
      message: authMessages.SIGNUP.SUCCESS,
      data: {
        _id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        company: newUser.company || '',
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: 'ERROR', message: error.errors.join(', ') };
    }
    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'adminCreateUser');
        scope.captureException(error);
      });
    }
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default adminCreateUser;
