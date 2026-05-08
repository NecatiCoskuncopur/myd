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
    city: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 35,
    },
    postalCode: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 15,
    },
  },
  { _id: false },
);

export default AddressSchema;
