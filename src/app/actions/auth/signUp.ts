'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import connectMongoDB from '@/lib/db';
import MydMail from '@/lib/mailer';
import messages from '@/lib/messages';
import { validateRecaptcha } from '@/lib/recaptcha';
import { sendSms } from '@/lib/sendSms';
import welcomeMail from '@/mailTemplates/welcome.mail';
import { Balance, User } from '@/models';
import createUserSchema from '@/schemas/createUser.schema';

interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
  };
  recaptchaToken: string;
}

const signUp = async (data: SignUpInput) => {
  try {
    await validateRecaptcha(data.recaptchaToken);

    await createUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      ...data,
      password: hashedPassword,
    });

    await Balance.create({ userId: newUser._id });

    await MydMail.sendMail({
      from: '"MYD Export" <noreply@mydexport.com>',
      to: newUser.email,
      subject: '🎉 Hoşgeldiniz!',
      html: welcomeMail,
    });

    if (newUser.phone) {
      const smsText = `Sayın ${newUser.firstName} ${newUser.lastName}, MYD Export'a hoşgeldiniz! Gönderi oluşturmaya başlayabilirsiniz, detaylar için sizi arayacağız, iyi çalışmalar ve bol kazançlar dileriz.`;
      await sendSms(newUser.phone, smsText);
    }

    return {
      success: true,
      message: messages.CU43,
    };
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      throw new Error(error.errors.join(', '));
    }

    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }

    throw new Error('Kullanıcı oluşturulurken hata oluştu');
  }
};

export default signUp;
