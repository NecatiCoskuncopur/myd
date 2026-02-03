'use server';

import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

import connectMongoDB from '@/lib/db';
import MydMail from '@/lib/mailer';
import { User } from '@/models';

interface ResetTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

const resetPassword = async (data: IResetPasswordForm) => {
  try {
    await connectMongoDB();

    const decoded = jwt.verify(data.token, process.env.JWT_SECRET!) as ResetTokenPayload;

    if (!decoded.userId || !decoded.email) {
      throw new Error('Geçersiz veya süresi dolmuş token');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await User.findByIdAndUpdate(decoded.userId, {
      $set: { password: hashedPassword },
    });

    await MydMail.sendMail({
      to: decoded.email,
      subject: 'Parolanız Sıfırlandı!',
      html: 'Parolanız başarıyla sıfırlandı. Eğer bu işlemi siz yapmadıysanız lütfen hemen bizimle iletişime geçin.',
    });

    return {
      status: 'OK',
    };
  } catch (error) {
    console.error(error);
    throw new Error('Parola sıfırlama işlemi başarısız');
  }
};

export default resetPassword;
