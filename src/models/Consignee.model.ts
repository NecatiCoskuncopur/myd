import mongoose from 'mongoose';

const ConsigneeSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  name: String,
  company: String,
  phone: String,
  email: String,
  identityNumber: String,
  address: {
    line1: String,
    line2: String,
    city: String,
    postalCode: String,
    state: String,
    country: String,
  },
});

const Consignee = mongoose.models.Consignee || mongoose.model('Consignee', ConsigneeSchema);

export default Consignee;
