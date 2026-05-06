import { type InferSchemaType, model, models, Schema } from 'mongoose';

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
    },
    accountNumber: { type: String, required: true },
    isActive: {
      type: Boolean,
      default: true,
    },

    credentials: {
      type: [CarrierCredentialSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, 'En az bir credential gereklidir.'],
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

export type CarrierAccountDocument = InferSchemaType<typeof CarrierAccountSchema>;

const CarrierAccount = models.CarrierAccount || model('CarrierAccount', CarrierAccountSchema);

export default CarrierAccount;
