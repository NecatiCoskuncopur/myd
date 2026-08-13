import { Schema } from 'mongoose';

const PricingZoneSchema = new Schema(
  {
    number: {
      type: Number,
      min: 1,
      max: 9,
      required: true,
    },
    prices: [
      {
        _id: false,
        weight: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    than: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

export default PricingZoneSchema;
