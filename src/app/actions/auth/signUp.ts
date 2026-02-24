'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { messages, welcomeMail } from '@/constants';
import connectMongoDB from '@/lib/db';
import MydMail from '@/lib/mailer';
import { sendSms } from '@/lib/sendSms';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { User } from '@/models';
import createUserSchema from '@/schema/createUser.schema';

const signUp = async (data: ISignUpPayload): Promise<IActionResponse> => {
  let validatedData: ISignUpPayload;

  try {
    validatedData = await createUserSchema.validate(data, {
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
    await validateRecaptcha(validatedData.recaptchaToken);

    await connectMongoDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return {
        status: 'ERROR',
        message: 'User already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const newUser = await User.create({
      ...validatedData,
      password: hashedPassword,
    });

    // await Balance.create({ userId: newUser._id });

    try {
      await MydMail.sendMail({
        from: '"MYD Export" <noreply@mydexport.com>',
        to: newUser.email,
        subject: '🎉 Hoşgeldiniz!',
        html: welcomeMail,
      });
    } catch (mailError) {
      console.error('Welcome mail error:', mailError);
    }

    if (newUser.phone) {
      try {
        const smsText = `Sayın ${newUser.firstName} ${newUser.lastName}, MYD Export'a hoşgeldiniz! Gönderi oluşturmaya başlayabilirsiniz, detaylar için sizi arayacağız, iyi çalışmalar ve bol kazançlar dileriz.`;

        await sendSms(newUser.phone, smsText);
      } catch (smsError) {
        console.error('Welcome SMS error:', smsError);
      }
    }

    return {
      status: 'OK',
      message: messages.AUTH.SIGNUP_SUCCESS,
    };
  } catch (error) {
    console.error('Sign up Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default signUp;
