const transactionMessages = {
  AMOUNT: {
    TYPE: 'İşlem miktarı sayı tipinde olmalıdır.',
    REQUIRED: 'İşlem miktarı zorunludur.',
    MIN: 'İşlem miktarı 0.01 den küçük olamaz',
  },
  BALANCE: {
    ERROR: 'Bakiye işlenirken hata oluştu!',
    INVALID: 'Bakiye işlem tipi geçersiz.',
    NOT_FOUND: 'Bakiye bulunamadı',
  },
  NOTE: {
    TYPE: 'İşlem notu metin tipinde olmalı.',
    MAX: 'İşlem notu en fazla 35 karakter olmalı.',
  },
  TYPE: {
    INVALID: 'İşlem tipi geçersiz',
    REQUIRED: 'İşlem tipi zorunludur.',
  },
  USERID: {
    TYPE: 'Kullanıcı ID değeri string tipinde olmalıdır.',
    REQUIRED: 'Kullanıcı ID zorunludur.',
  },

  SUCCESS: 'Kullanıcının bakiyesi başarıyla güncellendi.',
} as const;

export default transactionMessages;
