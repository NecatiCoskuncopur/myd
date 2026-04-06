const pricingListMessages = {
  NOT_FOUND: 'Fiyat listesi bulunamadı',
  ID_TYPE: 'Fiyat listesi id metin tipinde olmalıdır.',
  ID_REQUIRED: 'Fiyat listesi id zorunludur.',
  USER_LIST_UNDEFINED: 'Kullanıcı fiyat listesi tanımlı değil',
  TYPE: 'Fiyat listesi metin tipinde olmalıdır.',
  REQUIRED: 'Fiyat listesi zorunludur.',
  EXIST: 'Bu isimde bir liste zaten var.',
  SUCCESS: 'Fiyat listesi başarıyla oluşturuldu.',
  UPDATE: 'Fiyat listesi başarıyla güncellendi',
  NAME: {
    TYPE: 'Liste adı metin tipinde olmalı.',
    MIN: 'Liste adı en az 2 karakter olmalıdır.',
    MAX: 'Liste adı en fazla 75 karakter olmalıdır',
    REQUIRED: 'Liste adı zorunludur',
  },
  ZONE: {
    REQUIRED: 'Bölge zorunludur',
    THAN_REQUIRED: 'Paket aşımı değeri zorunludur',
    NUMBER: {
      TYPE: 'Bölge kodu sayı tipinde olmalıdır.',
      MIN: 'Bölge kodu en küçük 1 olabilir',
      REQUIRED: 'Bölge kodu zorunludur',
    },
    PRICES: {
      WEIGHT_TYPE: 'Ağırlık sayı tipinde olmalıdır.',
      WEIGHT_MIN: 'Ağırlık pozitif sayı olmalıdır.',
      WEIGHT_REQUIRED: 'Ağırlık zorunludur.',
      PRICE_TYPE: 'Fiyat sayı tipinde olmalıdır.',
      PRICE_MIN: 'Fiyat pozitif sayı olmalıdır.',
      PRICE_REQUIRED: 'Fiyat zorunludur.',
    },
  },
  PRICE: {
    NOT_FOUND: 'Fiyat bulunamadı.',
  },
  PRICING: {
    NOT_FOUND: 'Fiyatlandırma bulunamadı.',
    USER_NOT_FOUND: 'Fiyatlandırma kullanıcısı bulunamadı',
  },
} as const;

export default pricingListMessages;
