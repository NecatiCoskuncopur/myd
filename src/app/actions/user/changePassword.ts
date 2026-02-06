'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { getCurrentUser } from '@/lib/getCurrentUser';
import messages from '@/lib/messages';
import { User } from '@/models';
import changePasswordSchema from '@/schemas/changePassword.schema';

const changePassword = async (data: IChangePasswordForm): Promise<{ success: true }> => {
  try {
    await changePasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      throw new Error(error.errors.join(', '));
    }
    throw error;
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('Yetkisiz işlem');

  const user = await User.findById(currentUser.id);
  if (!user) throw new Error('Yetkisiz işlem');

  const isCorrect = await bcrypt.compare(data.currentPassword, user.password);
  if (!isCorrect) throw new Error(messages.CP01);

  user.password = await bcrypt.hash(data.newPassword, 10);
  await user.save();

  return { success: true };
};

export default changePassword;
