const addressMessages = {
  CITY: {
    TYPE: 'Şehir metin tipinde olmalı',
    MIN: 'Şehir en az 2 karakter olmalı.',
    MAX: 'Şehir en fazla 35 karakter olmalı.',
    REQUIRED: 'Şehir zorunludur.',
  },
  COUNTRY: {
    NOT_FOUND: 'Ülke bulunamadı',
    TYPE: 'Ülke metin tipinde olmalı',
    MIN: 'Ülke en az 2 karakter olabilir.',
    MAX: 'Ülke en fazla 45 karakter olabilir.',
    REQUIRED: 'Ülke zorunludur.',
  },
  DISTRICT: {
    TYPE: 'İlçe metin tipinde olmalı',
    MIN: 'İlçe en az 2 karakter olmalı.',
    MAX: 'İlçe en fazla 25 karakter olmalı.',
    REQUIRED: 'İlçe zorunludur.',
  },
  LINE: {
    TYPE: 'Adres metin tipinde olmalı.',
    MIN: 'Adres en az 5 karakter olmalı.',
    MAX: 'Adres en fazla 255 karakter olmalı',
    REQUIRED: 'Adres zorunludur.',
  },
  POSTALCODE: {
    TYPE: 'Posta kodu metin tipinde olmalıdır.',
    LENGTH: 'Posta Kodu  5 karakter olmalı.',
    REQUIRED: 'Posta Kodu zorunludur.',
  },
  STATE: {
    TYPE: 'Eyalet metin tipinde olmalı',
    MIN: 'Eyalet en az 2 karakter olabilir.',
    MAX: 'Eyalet en fazla 45 karakter olabilir.',
  },
} as const;

export default addressMessages;
