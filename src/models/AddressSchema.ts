import { Schema } from 'mongoose';

const AddressSchema = new Schema(
  {
    line1: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 255,
    },
    line2: {
      type: String,
      maxLength: 255,
    },
    district: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 25,
    },
    city: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 35,
    },
    postalCode: {
      type: String,
      required: true,
      length: 5,
      validate: {
        validator: (v: string) => /^\d{5}$/.test(v),
        message: 'Postal code must be exactly 5 digits',
      },
    },
  },
  { _id: false },
);

export default AddressSchema;
