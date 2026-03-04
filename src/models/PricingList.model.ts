import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const PricingListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    zone: [
      {
        _id: false,
        number: {
          type: Number,
          min: 1,
          max: 9,
          required: true,
        },
        prices: [
          {
            _id: false,
            weight: Number,
            price: Number,
          },
        ],
        than: Number,
      },
    ],
  },
  { timestamps: true },
);

PricingListSchema.plugin(mongoosePaginate);

const PricingList = mongoose.models.PricingList || mongoose.model('PricingList', PricingListSchema);

export default PricingList;
