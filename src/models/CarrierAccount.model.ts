import mongoose, { HydratedDocument, InferSchemaType, Schema, Types } from 'mongoose';
import { Carrier } from '@/constants';

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
