declare namespace ShippingBarcodeTypes {
  interface ISaveShippingLabelPayload {
    shippingId: string;
    pdf: Buffer;
  }
}
