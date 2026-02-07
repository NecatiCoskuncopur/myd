import * as yup from 'yup';

export default yup.object({
  senderId: yup.string(),
  consignee: yup
    .object({
      _id: yup.string(),
      name: yup.string().min(4).max(35).required(),
      company: yup.string().min(2).max(35),
      phone: yup.string().min(5).max(35),
      email: yup.string().email(),
      taxId: yup.string().max(35),
      address: yup
        .object({
          line1: yup.string().min(4).max(35).required(),
          line2: yup.string().min(4).max(35),
          country: yup.string().length(2).required(),
          state: yup.string().length(2),
          city: yup.string().min(2).max(35).required(),
          postalCode: yup.string().max(10).required(),
        })
        .required(),
    })
    .required(),

  detail: yup
    .object({
      payor: yup
        .object({
          shipping: yup.string().oneOf(['SENDER', 'CONSIGNEE']).required(),
          customs: yup.string().oneOf(['SENDER', 'CONSIGNEE']).required(),
        })
        .required(),
      iossNumber: yup.string().length(12),
      purpose: yup.string().oneOf(['GIFT', 'PERSONAL', 'SAMPLE', 'REPAIR_OR_RETURN', 'COMMERCIAL']).required(),
    })
    .required(),

  content: yup
    .object({
      currency: yup.string().oneOf(['USD', 'EUR', 'GBP']).required(),
      description: yup.string().max(50),
      freight: yup.number().min(1),
      products: yup
        .array()
        .of(
          yup.object({
            name: yup.string().min(2).max(25).required(),
            piece: yup.number().min(1).required(),
            unitPrice: yup.number().required(),
            harmonizedCode: yup.string(),
          }),
        )
        .min(1)
        .required(),
    })
    .required(),

  package: yup
    .object({
      weight: yup.number().min(0.5).required(),
      numberOfPackage: yup.number().min(1).max(55).required(),
      width: yup.number().min(0.5).max(500).required(),
      height: yup.number().min(0.5).max(500).required(),
      length: yup.number().min(0.5).max(500).required(),
    })
    .required(),
});
