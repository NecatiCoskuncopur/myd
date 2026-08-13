import mongoose, { HydratedDocument, InferSchemaType, Schema, Types } from 'mongoose';
import { Carrier, emailRegex, phoneRegex, userMessages } from '@/constants';
import PricingZoneSchema from './PricingZoneSchema.model';

const { EMAIL, PHONE } = userMessages;

const CarrierCredentialSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const CarrierAccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    carrier: {
      type: String,
      required: true,
      enum: Object.values(Carrier),
    },
    accountNumber: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    credentials: {
      type: [CarrierCredentialSchema],
      required: true,
      validate: [(val: unknown[]) => val.length > 0, 'En az bir credential gereklidir.'],
    },
    pricing: {
      zones: {
        type: [PricingZoneSchema],
        default: [],
      },
    },
    hasCustomInfo: {
      type: Boolean,
      default: false,
    },
    customInfo: {
      email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        validate: {
          validator: value => !value || emailRegex.test(value),
          message: EMAIL.INVALID,
        },
      },
      firstName: {
        type: String,
        minLength: 2,
        maxLength: 75,
      },
      lastName: {
        type: String,
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
        validate: {
          validator: value => phoneRegex.test(value),
          message: PHONE.INVALID,
        },
      },
      address: {
        line1: {
          type: String,
          minLength: 5,
          maxLength: 255,
        },
        line2: {
          type: String,
          maxLength: 255,
        },
        city: {
          type: String,
          minLength: 2,
          maxLength: 35,
        },
        postalCode: {
          type: String,
          minLength: 3,
          maxLength: 15,
        },
        district: {
          type: String,
          minLength: 2,
          maxLength: 25,
        },
      },
    },
    meta: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  },
);

export type ICarrierAccount = InferSchemaType<typeof CarrierAccountSchema>;

export type CarrierAccountDocument = HydratedDocument<ICarrierAccount> & {
  _id: Types.ObjectId;
};

const CarrierAccount =
  (mongoose.models.CarrierAccount as mongoose.Model<ICarrierAccount>) ?? mongoose.model<ICarrierAccount>('CarrierAccount', CarrierAccountSchema);

export default CarrierAccount;
