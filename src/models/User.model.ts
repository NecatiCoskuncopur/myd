import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

const UserSchema = new mongoose.Schema(
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
      minLength: 2,
      maxlength: 75,
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 75,
    },
    company: {
      type: String,
      minlength: 2,
      maxlength: 75,
    },
    phone: String,
    priceListId: mongoose.Types.ObjectId, // priceList sonra ref
    address: {
      line1: String,
      line2: String,
      district: String,
      postalCode: String,
      city: String,
    },
    role: {
      type: String,
      required: true,
      enum: ['CUSTOMER', 'OPERATOR', 'ADMIN'],
      default: 'CUSTOMER',
    },
    barcodePermits: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

UserSchema.plugin(mongoosePaginate);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
