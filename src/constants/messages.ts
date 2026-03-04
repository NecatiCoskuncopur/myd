const messages = {
  ADDRESS: {
    COUNTRY: {
      NOT_FOUND: 'Ülke bulunamadı',
      TYPE: 'Ülke metin tipinde olmalı',
      MIN: 'Ülke en az 2 karakter olabilir.',
      MAX: 'Ülke en fazla 45 karakter olabilir.',
      REQUIRED: 'Ülke zorunludur.',
    },
  },
  BALANCE: {
    ERROR: 'Bakiye işlenirken hata oluştu!',
    INVALID: 'Bakiye işlem tipi geçersiz.',
    NOT_FOUND: 'Bakiye bulunamadı',
  },
  CARRIER: {
    AUTH_FAILED: 'Kimlik doğrulaması başarısız oldu.',
    SHIPMENT_FAILED: 'Gönderim başarısız oldu',
    TRACKING_NUMBER_NOT_FOUND: 'Takip numarası bulunamadı.',
  },
  CAPTCHA: {
    SECRET_MISSING: 'Captcha secret bilgisi eksik.',
    TOKEN_MISSING: 'Captcha token bilgisi eksik.',
    INVALID: 'Geçersiz Captcha!',
    SERVER_ERROR: 'Captcha doğrulama sunucusundan yanıt alınamadı.',
  },
  GENERAL: {
    UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu',
    UNAUTHORIZED: 'Yetkisiz işlem',
  },
  PRICING: {
    NOT_FOUND: 'Fiyatlandırma bulunamadı.',
    USER_NOT_FOUND: 'Fiyatlandırma kullanıcısı bulunamadı',
  },
  PRICE: {
    NOT_FOUND: 'Fiyat bulunamadı.',
  },
} as const;

export default messages;
