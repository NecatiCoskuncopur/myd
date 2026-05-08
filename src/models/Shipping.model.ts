import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { AddressSchema } from '@/models';

const ShippingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    consigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consignee', index: true },
    sender: {
      name: String,
      company: String,
      phone: String,
      email: String,
      address: {
        ...AddressSchema.obj,
        district: {
          type: String,
          required: true,
          minLength: 2,
          maxLength: 25,
        },
      },
    },
    consignee: {
      name: { type: String, maxlength: 35 },
      company: { type: String, maxlength: 35 },
      phone: String,
      email: String,
      taxId: String,
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
    detail: {
      payor: {
        shipping: {
          type: String,
          enum: ['SENDER', 'CONSIGNEE'],
        },
        customs: {
          type: String,
          enum: ['SENDER', 'CONSIGNEE'],
        },
      },
      iossNumber: { type: String, maxLength: 12 },
      purpose: {
        type: String,
        enum: ['GIFT', 'PERSONAL', 'SAMPLE', 'REPAIR_OR_RETURN', 'COMMERICAL'],
      },
    },
    content: {
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP'],
      },
      description: { type: String, maxlength: 50 },
      freight: Number,
      products: [
        {
          _id: false,
          name: { type: String, minLength: 2, maxlength: 125 },
          unitPrice: { type: Number, min: 0.1 },
          piece: { type: Number, min: 1 },
          gtip: { type: String, maxlength: 35 },
        },
      ],
    },
    package: {
      weight: { type: Number, min: 0.5 },
      numberOfPackage: { type: Number, min: 1, max: 55 },
      width: { type: Number, min: 0.5, max: 500 },
      height: { type: Number, min: 0.5, max: 500 },
      length: { type: Number, min: 0.5, max: 500 },
      volumetricWeight: Number,
    },
    status: {
      type: String,
      enum: ['CREATED', 'LABELED', 'CANCELED'],
      default: 'CREATED',
      index: true,
    },
    carrier: {
      name: {
        type: String,
        enum: ['FEDEX', 'TNT', 'UPS'],
      },
      account: String,
      trackingNumber: String,
      amount: Number,
    },
    labelLink: String,
    activities: [
      {
        userId: mongoose.Types.ObjectId,
        type: {
          type: String,
          enum: ['EDIT', 'LABELING'],
        },
        data: String,
      },
    ],
  },
  { timestamps: true },
);

ShippingSchema.plugin(mongoosePaginate);

const Shipping = mongoose.models.Shipping || mongoose.model('Shipping', ShippingSchema);

export default Shipping;
