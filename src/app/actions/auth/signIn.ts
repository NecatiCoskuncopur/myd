'use server';

import { cookies } from 'next/headers';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import connectMongoDB from '@/lib/db';
import messages from '@/lib/messages';
import { validateRecaptcha } from '@/lib/recaptcha';
import { User } from '@/models';

interface SignInInput {
  email: string;
  password: string;
  recaptchaToken: string;
}

const signIn = async (data: SignInInput) => {
  try {
    await validateRecaptcha(data.recaptchaToken);

    await connectMongoDB();

    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new Error(messages.CU45);
    }

    const isCorrectPassword = await bcrypt.compare(data.password, user.password);

    if (!isCorrectPassword) {
      throw new Error(messages.CU45);
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    if (!token) {
      throw new Error(messages.CU46);
    }

    const cookieStore = await cookies();

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return {
      result: 'ok',
      role: user.role,
      barcodePermits: user.barcodePermits,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default signIn;
