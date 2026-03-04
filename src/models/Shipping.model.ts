import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ShippingSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    consigneeId: mongoose.Types.ObjectId,
    sender: {
      name: String,
      company: String,
      phone: String,
      email: String,
      address: {
        line1: String,
        line2: String,
        district: String,
        postalCode: String,
        city: String,
      },
    },
    consignee: {
      name: { type: String, max: 35 },
      company: { type: String, max: 35 },
      phone: String,
      email: String,
      taxId: String,
      address: {
        line1: { type: String, min: 5, max: 35 },
        line2: { type: String, max: 35 },
        country: { type: String, length: 2 },
        state: { type: String, length: 2 },
        city: { type: String, min: 2, max: 35 },
        postalCode: { type: String, max: 10 },
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
      iossNumber: { type: String, length: 12 },
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
      description: { type: String, max: 50 },
      freight: Number,
      products: [
        {
          _id: false,
          name: { type: String, min: 2, max: 125 },
          unitPrice: { type: Number, min: 0.1 },
          piece: { type: Number, min: 1 },
          gtip: { type: String, max: 35 },
        },
      ],
    },
    package: {
      weight: { type: Number, min: 0.5 },
      numberOfPackage: { type: Number, min: 1, max: 55 },
      width: { type: Number, min: 0.5, max: 500 },
      height: { type: Number, min: 0.5, max: 500 },
      length: { type: Number, min: 0.5, max: 500 },
    },
    status: {
      type: String,
      enum: ['CREATED', 'LABELED', 'CANCELED'],
      default: 'CREATED',
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
