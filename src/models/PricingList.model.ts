import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import PricingZoneSchema from './PricingZoneSchema.model';
import { CarrierAccountTypeEnum } from '@/constants';

const PricingListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    listType: {
      type: String,
      required: true,
      enum: Object.values(CarrierAccountTypeEnum),
    },
    zone: {
      type: [PricingZoneSchema],
      default: [],
    },
  },
  { timestamps: true },
);

PricingListSchema.index({ name: 1 }, { unique: true });
PricingListSchema.plugin(mongoosePaginate);
export type IPricingList = InferSchemaType<typeof PricingListSchema>;
export type PricingListDocument = HydratedDocument<IPricingList> & {
  _id: Types.ObjectId;
};
export type PricingListModel = PaginateModel<IPricingList>;

const PricingList: PricingListModel =
  (mongoose.models.PricingList as PricingListModel) ?? mongoose.model<IPricingList, PricingListModel>('PricingList', PricingListSchema);
export default PricingList;
