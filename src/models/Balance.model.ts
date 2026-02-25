import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const BalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      unique: true,
    },
    total: Number,
    transactions: [
      {
        transactionType: {
          type: String,
          required: true,
          enum: ['PAY', 'SPEND'],
        },
        amount: Number,
        shippingId: mongoose.Types.ObjectId,
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
