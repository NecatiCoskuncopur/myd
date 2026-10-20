const ExcelColumns = {
  senderName: 'Gönderici Adı',
  senderCompany: 'Gönderici Firma',
  consigneeName: 'Alıcı Adı',
  consigneeCountry: 'Alıcı Ülke',
  trackingNumber: 'Takip Kodu',
  weight: 'Ağırlık/Desi',
  accountType: 'Servis Tipi',
  price: 'Navlun Bedeli',
  insuranceAmount: 'Sigorta Bedeli',
  taxAmount: 'Vergi Bedeli',
  serviceFee: 'Servis Bedeli',
  longSideCost: 'Uzun Kenar Ek Ücreti',
  totalShippingCost: 'Ödenecek Toplam Tutar',
  content: 'İçerik',
  totalContentValue: 'İçerik Toplam Tutarı',
  date: 'Tarih',
  status: 'Durum',
} as const;

export default ExcelColumns;
