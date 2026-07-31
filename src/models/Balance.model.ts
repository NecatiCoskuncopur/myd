import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Schema, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const BalanceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        transactionType: {
          type: String,
          required: true,
          enum: ['PAY', 'SPEND'],
        },
        amount: {
          type: Number,
          required: true,
        },
        shippingId: {
          type: Schema.Types.ObjectId,
          ref: 'Shipping',
        },
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

BalanceSchema.plugin(mongoosePaginate);
export type IBalance = InferSchemaType<typeof BalanceSchema>;

export type BalanceDocument = HydratedDocument<IBalance> & {
  _id: Types.ObjectId;
};
export type BalanceModel = PaginateModel<IBalance>;
export type ITransaction = IBalance['transactions'][number];
const Balance: BalanceModel = (mongoose.models.Balance as BalanceModel) ?? mongoose.model<IBalance, BalanceModel>('Balance', BalanceSchema);

export default Balance;
