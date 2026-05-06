const carrierMessages = {
  AUTH_FAILED: 'Kimlik doğrulaması başarısız oldu.',
  NOT_FOUND: 'Taşıyıcı firma bulunamadı.',
  SHIPMENT_FAILED: 'Gönderim başarısız oldu',
  TRACKING_NUMBER_NOT_FOUND: 'Takip numarası bulunamadı.',
  UNAUTHORIZED: 'Bu kargo firması/hesap için yetkiniz yok.',
  UNSUPPORTED: 'Desteklenmeyen taşıyıcı firma.',
  INVALID_ID: 'Geçersiz hesap ID formatı.',
  CREATE: {
    SUCCESS: 'Kargo hesabı başarıyla oluşturuldu.',
  },
  UPDATE: {
    ID_TYPE: 'Taşıyıcı firma id metin tipinde olmalıdır',
    ID_REQUIRED: 'Taşıyıcı firma id zorunludur.',
    SUCCESS: 'Kargo hesabı başarıyla güncellendi.',
  },
  NAME: {
    TYPE: 'Hesap adı metin tipinde olmalı.',
    MIN: 'Hesap adı en az 2 karakter olmalıdır.',
    MAX: 'Hesap adı en fazla 75 karakter olmalıdır.',
    REQUIRED: 'Hesap adı zorunludur.',
  },
  CARRIER: {
    TYPE_INVALID: 'Geçersiz taşıyıcı firma.',
    REQUIRED: 'Taşıyıcı firma zorunludur',
    NOT_FOUND: 'Kargo hesabı bulunamadı.',
  },
  ACCOUNTNUMBER: {
    TYPE: 'Hesap numarası metin tipinde olmalı.',
    MIN: 'Hesap numarası en az 1 karakter olmalıdır',
    REQUIRED: 'Hesap numarası zorunludur.',
    ALREADY_EXISTS: 'Bu hesap numarası zaten kayıtlı',
  },
  CREDENTIALS: {
    KEY_REQUIRED: 'Anahtar (Key) adı boş olamaz',
    VALUE_REQUIRED: 'Değer (Value) boş olamaz',
    MIN: 'Kargo entegrasyonu için en az 2 adet kimlik bilgisi (Key/Secret) gereklidir',
    REQUIRED: 'Kimlik bilgileri zorunludur',
  },
} as const;

export default carrierMessages;
