'use server';

import { ValidationError } from 'yup';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee, Shipping, User } from '@/models';
import createShippingSchema from '@/schemas/createShipping.schema';

const createShipping = async (data: ICreateShippingForm) => {
  try {
    const validatedData = await createShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new Error('Yetkisiz İşlem');
    }

    let consignee;
    let userId: string;
    if ((currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR') && validatedData.senderId) {
      userId = validatedData.senderId;
    } else {
      userId = currentUser.id;
    }

    if (validatedData.consignee._id) {
      consignee = await Consignee.findOne({
        userId,
        _id: validatedData.consignee._id,
      });
    } else {
      consignee = new Consignee({
        userId,
        ...validatedData.consignee,
      });

      await consignee.save();
    }

    if (!consignee) {
      throw new Error('CONSIGNEE_NOT_FOUND');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const shipping = new Shipping({
      ...validatedData,
      userId,
      sender: {
        name: `${user.firstName} ${user.lastName}`,
        company: user.company,
        phone: user.phone,
        address: user.address,
      },
      consignee,
    });

    await shipping.save();

    return shipping;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(error.errors.join(', '));
    }

    throw error;
  }
};

export default createShipping;
