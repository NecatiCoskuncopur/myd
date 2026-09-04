import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const SystemParamSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

SystemParamSchema.index({ key: 1 }, { unique: true });
SystemParamSchema.plugin(mongoosePaginate);

export type ISystemParam = InferSchemaType<typeof SystemParamSchema>;
export type SystemParamDocument = HydratedDocument<ISystemParam> & {
  _id: Types.ObjectId;
};
export type SystemparamModel = PaginateModel<ISystemParam>;

const SystemParam: SystemparamModel =
  (mongoose.models.SystemParam as SystemparamModel) ?? mongoose.model<ISystemParam, SystemparamModel>('SystemParam', SystemParamSchema);
export default SystemParam;
