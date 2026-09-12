import { InferSchemaType, model, models, PaginateModel, Schema } from 'mongoose';

import { AdditionalDocumentEnum } from '@/constants';

const AdditionalDocumentSchema = new Schema(
  {
    data: {
      type: Buffer,
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(AdditionalDocumentEnum),
      required: true,
      default: AdditionalDocumentEnum.OTHER,
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
