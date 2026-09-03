declare namespace ShippingDocumentTypes {
  interface ISaveShippingDocumentPayload {
    shippingId: string;
    label?: Buffer;
    invoice?: Buffer;
  }

  interface ISaveAdditionalDocumentPayload {
    shippingId: string;
    additionalDocument?: Buffer;
  }
}
