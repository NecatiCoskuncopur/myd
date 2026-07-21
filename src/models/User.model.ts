import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { AddressSchema } from '@/models';
import { UserTypes } from '@/types/user';

const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

const UserSchema = new Schema<UserTypes.IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 75,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 75,
    },
    company: {
      type: String,
      minLength: 2,
      maxLength: 75,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: (v: string) => /^[5]\d{9}$/.test(v),
        message: 'Telefon numarası 5 ile başlamalı ve 10 hane olmalıdır',
      },
    },
    priceListId: {
      type: Schema.Types.ObjectId,
      ref: 'PricingList',
    },
    address: {
      ...AddressSchema.obj,
      district: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
      },
    },
    role: {
      type: String,
      required: true,
      enum: ['CUSTOMER', 'OPERATOR', 'ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    barcodePermits: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

UserSchema.plugin(paginate);

const User = (mongoose.models.User ||
  mongoose.model<UserTypes.IUser, mongoose.PaginateModel<UserTypes.IUser>>('User', UserSchema)) as mongoose.PaginateModel<UserTypes.IUser>;

export default User;
