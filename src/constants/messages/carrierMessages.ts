const carrierMessages = {
  AUTH_FAILED: 'Kimlik doğrulaması başarısız oldu.',
  NOT_FOUND: 'Taşıyıcı firma bulunamadı.',
  SHIPMENT_FAILED: 'Gönderim başarısız oldu',
  TRACKING_NUMBER_NOT_FOUND: 'Takip numarası bulunamadı.',
  UNAUTHORIZED: 'Bu kargo firması/hesap için yetkiniz yok.',
  UNSUPPORTED: 'Desteklenmeyen taşıyıcı firma.',
} as const;

export default carrierMessages;
