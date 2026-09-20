import { InferSchemaType, model, models, PaginateModel, Schema } from 'mongoose';

import { AdditionalDocumentContentTypeEnum } from '@/constants';

const AdditionalDocumentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      enum: Object.values(AdditionalDocumentContentTypeEnum),
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'additionalDocuments',
  },
);

AdditionalDocumentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export type IAdditionalDocument = InferSchemaType<typeof AdditionalDocumentSchema>;

export type AdditionalDocumentModel = PaginateModel<IAdditionalDocument>;

const AdditionalDocument: AdditionalDocumentModel =
  (models.AdditionalDocument as AdditionalDocumentModel) ?? model<IAdditionalDocument, AdditionalDocumentModel>('AdditionalDocument', AdditionalDocumentSchema);

export default AdditionalDocument;
