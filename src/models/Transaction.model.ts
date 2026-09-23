import mongoose, { HydratedDocument, InferSchemaType, PaginateModel, Schema, Types } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true },
);

TransactionSchema.index({ userId: 1, createdAt: -1 });

TransactionSchema.plugin(paginate);

export type ITransaction = InferSchemaType<typeof TransactionSchema>;

export type TransactionDocument = HydratedDocument<ITransaction> & {
  _id: Types.ObjectId;
};

export type TransactionModel = PaginateModel<ITransaction>;

const Transaction: TransactionModel =
  (mongoose.models.Transaction as TransactionModel) ?? mongoose.model<ITransaction, TransactionModel>('Transaction', TransactionSchema);

export default Transaction;
