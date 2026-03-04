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
