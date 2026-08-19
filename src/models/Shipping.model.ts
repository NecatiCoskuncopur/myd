import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Types } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { Carrier, CarrierAccountTypeEnum, CurrencyEnum, ShippingActivities, ShippingPayor, ShippingPurpose, ShippingStatus } from '@/constants';

const ShippingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    consigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consignee', index: true },
    sender: {
      name: String,
      nickname: String,
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
      name: { type: String, maxlength: 35, required: true },
      company: {
        type: String,
        minLength: 5,
        maxLength: 75,
      },
      phone: String,
      email: String,
      taxId: String,
      address: {
        line1: { type: String, minLength: 5, maxlength: 35, required: true },
        line2: { type: String, maxlength: 35 },
        country: { type: String, length: 2, required: true },
        state: { type: String, length: 2 },
        city: { type: String, minLength: 2, maxlength: 35, required: true },
        postalCode: { type: String, maxlength: 10, required: true },
      },
    },
    detail: {
      payor: {
        shipping: {
          type: String,
          enum: Object.values(ShippingPayor),
        },
        customs: {
          type: String,
          enum: Object.values(ShippingPayor),
        },
      },
      iossNumber: { type: String, length: 12 },
      purpose: {
        type: String,
        enum: Object.values(ShippingPurpose),
      },
    },
    content: {
      currency: {
        type: String,
        enum: Object.values(CurrencyEnum),
      },
      description: { type: String, maxlength: 50 },
      freight: Number,
      insurance: Number,
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
      weight: { type: Number, min: 0.5, required: true },
      numberOfPackage: { type: Number, min: 1, max: 55, required: true },
      width: { type: Number, min: 0.5, max: 500, required: true },
      height: { type: Number, min: 0.5, max: 500, required: true },
      length: { type: Number, min: 0.5, max: 500, required: true },
      volumetricWeight: Number,
    },
    status: {
      type: String,
      enum: Object.values(ShippingStatus),
      default: ShippingStatus.CREATED,
      index: true,
    },
    carrier: {
      name: {
        type: String,
        enum: Object.values(Carrier),
      },
      displayName: String,
      accountType: {
        type: String,
        enum: Object.values(CarrierAccountTypeEnum),
      },
      account: String,
      trackingNumber: String,
      amount: Number,
      cost: Number,
    },
    labelLink: String,
    labeledAt: Date,
    activities: [
      {
        userId: mongoose.Types.ObjectId,
        type: {
          type: String,
          enum: Object.values(ShippingActivities),
        },
        data: String,
      },
    ],
  },
  { timestamps: true },
);

ShippingSchema.plugin(paginate);

export type IShipping = InferSchemaType<typeof ShippingSchema>;
export type ShippingDocument = HydratedDocument<IShipping> & {
  _id: Types.ObjectId;
};
export type ShippingModel = PaginateModel<IShipping>;

const Shipping: ShippingModel = (mongoose.models.Shipping as ShippingModel) ?? mongoose.model<IShipping, ShippingModel>('Shipping', ShippingSchema);

export default Shipping;
