const ExcelColumns = {
  senderName: 'Gönderici Adı',
  senderCompany: 'Gönderici Firma',
  consigneeName: 'Alıcı Adı',
  consigneeAddress: 'Alıcı Adres',
  consigneeCountry: 'Alıcı Ülke',
  consigneeState: 'Alıcı Eyalet',
  consigneePostalCode: 'Alıcı Posta Kodu',
  trackingNumber: 'Takip Kodu',
  weight: 'Ağırlık/Desi',
  price: 'Tutar',
  content: 'İçerik',
  totalContentValue: 'İçerik Toplam Tutarı',
  date: 'Tarih',
} as const;

export default ExcelColumns;
