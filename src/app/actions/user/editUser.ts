'use server';

import { ValidationError } from 'yup';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
import editUserSchema from '@/schemas/editUser.schema';

const editUser = async (data: IEditUserForm): Promise<{ success: true }> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz işlem');
  }

  try {
    await editUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      throw new Error(error.errors.join(', '));
    }
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    currentUser.id,
    {
      $set: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        phone: data.phone,
        email: data.email,
        address: data.address,
      },
    },
    { new: true },
  );

  if (!user) {
    throw new Error('Kullanıcı bulunamadı');
  }

  return { success: true };
};

export default editUser;
