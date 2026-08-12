import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Schema, Types } from 'mongoose';

const ShippingBarcodeSchema = new Schema(
  {
    shippingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    pdf: {
      type: Buffer,
      required: true,
    },

    contentType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
  },
  {
    timestamps: true,
    collection: 'shippingBarcodes',
  },
);

ShippingBarcodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type IShippingBarcode = InferSchemaType<typeof ShippingBarcodeSchema>;
export type ShippingBarcodeDocument = HydratedDocument<IShippingBarcode> & {
  _id: Types.ObjectId;
};

export type ShippingBarcodeModel = PaginateModel<IShippingBarcode>;

const ShippingBarcode: ShippingBarcodeModel =
  (mongoose.models.ShippingBarcode as ShippingBarcodeModel) ?? mongoose.model<IShippingBarcode, ShippingBarcodeModel>('ShippingBarcode', ShippingBarcodeSchema);

export default ShippingBarcode;
