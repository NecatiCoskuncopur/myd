'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { authMessages, BCRYPT_SALT_ROUNDS, generalMessages, userMessages, UserRole, welcomeMail } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import getMailTransport from '@/lib/mailer';
import requireRoles from '@/lib/requireRoles';
import sendSms from '@/lib/sendSms';
import { Balance, User } from '@/models';
import adminCreateUserSchema from '@/schemas/adminCreateUser.schema';
import { AdminTypes } from '@/types/admin';

const { SUCCESS } = authMessages.SIGNUP;
const { UNEXPECTED_ERROR } = generalMessages;
const { EXIST } = userMessages;

const adminCreateUser = async (data: AdminTypes.ICreateUser): Promise<ResponseTypes.IActionResponse<AdminTypes.ISearchSenderResult>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);

    if (authError) {
      return authError;
    }

    const validatedData = await adminCreateUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const email = validatedData.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email }).select('_id').lean();

    if (existingUser) {
      return {
        status: 'ERROR',
        message: EXIST,
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, BCRYPT_SALT_ROUNDS);

    const newUser = await User.create({
      ...validatedData,
      email,
      password: hashedPassword,
    });

    try {
      await Balance.create({
        userId: newUser._id,
        total: 0,
      });
    } catch (balanceError) {
      captureActionError('adminCreateUser.createBalance', balanceError, {
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

    try {
      const MydMail = await getMailTransport();
      await MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: newUser.email,
        subject: '🎉 Hesabınız Oluşturuldu!',
        html: welcomeMail,
      });
    } catch (mailError) {
      captureActionError('adminCreateUser.sendMail', mailError, {
        extras: {
          userId: newUser._id.toString(),
        },
      });
    }

    if (newUser.phone) {
      const smsText =
        `Sayın ${newUser.firstName} ${newUser.lastName}, ` + `MYD Export kaydınız admin tarafından tamamlanmıştır. ` + `Sisteme giriş yapabilirsiniz.`;

      try {
        await sendSms(newUser.phone, smsText);
      } catch (smsError) {
        captureActionError('adminCreateUser.sendSms', smsError, {
          extras: {
            userId: newUser._id.toString(),
          },
        });
      }
    }

    return {
      status: 'OK',
      message: SUCCESS,
      data: {
        _id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        company: newUser.company ?? '',
      },
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: EXIST,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('adminCreateUser', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default adminCreateUser;
