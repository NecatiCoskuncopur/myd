import mongoose, { HydratedDocument, InferSchemaType, Types } from 'mongoose';

const ConsigneeSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    name: {
      type: String,
      required: true,
    },
    company: String,
    phone: String,
    email: String,
    identityNumber: String,
    taxId: String,
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
        minLength: 3,
        maxLength: 15,
      },
      state: {
        type: String,
        required: false,
        minLength: 2,
        maxLength: 50,
      },
      country: {
        type: String,
        required: true,
        uppercase: true,
        minLength: 2,
        maxLength: 45,
      },
    },
  },
  { timestamps: true },
);

export type IConsignee = InferSchemaType<typeof ConsigneeSchema>;

export type ConsigneeDocument = HydratedDocument<IConsignee> & {
  _id: Types.ObjectId;
};

const Consignee = (mongoose.models.Consignee as mongoose.Model<IConsignee>) ?? mongoose.model<IConsignee>('Consignee', ConsigneeSchema);

export default Consignee;
