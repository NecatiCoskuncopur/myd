import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Schema, Types } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { emailRegex, phoneRegex, taxIdRegex, userMessages, UserRole } from '@/constants';

const { EMAIL, PHONE, TAXID } = userMessages;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: value => emailRegex.test(value),
        message: EMAIL.INVALID,
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
    nickname: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },
    company: {
      type: String,
      minLength: 5,
      maxLength: 75,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      validate: {
        validator: value => phoneRegex.test(value),
        message: PHONE.INVALID,
      },
    },
    taxId: {
      type: String,
      trim: true,
      validate: {
        validator: value => !value || taxIdRegex.test(value),
        message: TAXID.INVALID,
      },
    },
    taxOffice: {
      type: String,
      trim: true,
      maxlength: 75,
    },
    priceListId: {
      type: Schema.Types.ObjectId,
      ref: 'PricingList',
    },
    address: {
      line1: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 255,
      },
      line2: {
        type: String,
        maxLength: 255,
      },
      city: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 35,
      },
      postalCode: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 15,
      },
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
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
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

export type IUser = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<IUser> & {
  _id: Types.ObjectId;
};
export type UserModel = PaginateModel<IUser>;

const User: UserModel = (mongoose.models.User as UserModel) ?? mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;
