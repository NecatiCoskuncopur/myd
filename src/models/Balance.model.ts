import mongoose, { Schema } from 'mongoose';
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

const Balance = mongoose.models.Balance || mongoose.model('Balance', BalanceSchema);

export default Balance;
