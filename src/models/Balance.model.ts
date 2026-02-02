import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const BalanceScheme = new mongoose.Schema({
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
});

BalanceScheme.plugin(mongoosePaginate);

const BalanceModel = mongoose.models.Balance || mongoose.model('Balance', BalanceScheme);

export default BalanceModel;
