import mongoose, { InferSchemaType, PaginateModel, Schema } from 'mongoose';

const ShippingDocumentSchema = new Schema(
  {
    shippingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invoice: {
      type: Buffer,
      required: false,
    },
    label: {
      type: Buffer,
      required: false,
    },
    additionalDocument: {
      type: Buffer,
      required: false,
    },
    contentType: {
      type: String,
      required: true,
      default: 'application/pdf',
    },
  },
  {
    timestamps: true,
    collection: 'shippingDocuments',
  },
);

ShippingDocumentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type IShippingDocument = InferSchemaType<typeof ShippingDocumentSchema>;

export type ShippingDocumentModel = PaginateModel<IShippingDocument>;

const ShippingDocument: ShippingDocumentModel =
  (mongoose.models.ShippingDocument as ShippingDocumentModel) ??
  mongoose.model<IShippingDocument, ShippingDocumentModel>('ShippingDocument', ShippingDocumentSchema);

export default ShippingDocument;
