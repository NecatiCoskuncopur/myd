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

    isActive: {
      type: Boolean,
      default: true,
    },

    credentials: {
      type: [CarrierCredentialSchema],
      required: true,
    },

    meta: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export type CarrierAccountDocument = InferSchemaType<typeof CarrierAccountSchema>;

const CarrierAccount = models.CarrierAccount || model('CarrierAccount', CarrierAccountSchema);

export default CarrierAccount;
