import mongoose from 'mongoose';
import { AddressSchema } from '@/models';

const ConsigneeSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    name: String,
    company: String,
    phone: String,
    email: String,
    identityNumber: String,
    address: {
      ...AddressSchema.obj,
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

const Consignee = mongoose.models.Consignee || mongoose.model('Consignee', ConsigneeSchema);

export default Consignee;
