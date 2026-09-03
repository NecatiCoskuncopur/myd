const shippingDocumentMessages = {
  SHIPPINGID: {
    TYPE: 'Gönderi ID değeri metin tipinde olmalıdır.',
    REQUIRED: 'Gönderi ID zorunludur.',
  },
  INVOICE: {
    TYPE: 'Fatura dosyası geçerli değil.',
  },
  LABEL: {
    TYPE: 'Etiket dosyası geçerli değil.',
  },
  ADDITIONALDOCUMENT: {
    TYPE: 'Ek belge dosyası geçerli değil',
  },
} as const;

export default shippingDocumentMessages;
