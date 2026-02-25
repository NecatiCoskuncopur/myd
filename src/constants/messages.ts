const messages = {
  GENERAL: {
    UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'E-posta adresi veya parola hatalı!',
    TOKEN_GENERATION_FAILED: 'Giriş jetonu üretilirken hata oluştu!',
    SIGNOUT_ERROR: 'Çıkış yapılırken bir hata oluştu',
    INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
    SIGNUP_SUCCESS: 'Kayıt işlemi başarılı',
  },
  PASSWORD: {
    TYPE: 'Parola metin tipinde olmalı.',
    MIN: 'Parola en az 8 karakter olmalı.',
    MAX: 'Parola en fazla 255 karakter olmalı.',
    REQUIRED: 'Parola zorunludur.',
  },
  EMAIL: {
    TYPE: 'E-Posta adresi metin tipinde olmalı.',
    INVALID: 'E-Posta adresi geçersiz',
    REQUIRED: 'E-Posta adresi zorunludur.',
  },
  TOKEN: {
    TYPE: 'Token metin tipinde olmalı',
    REQUIRED: 'Token zorunludur.',
  },
  FIRSTNAME: {
    TYPE: 'Ad metin tipinde olmalı.',
    MIN: 'Ad en az 2 karakter olmalı.',
    MAX: 'Ad en fazla 75 karakter olmalı.',
    REQUIRED: 'Ad zorunludur.',
  },
  LASTNAME: {
    TYPE: 'Soyad metin tipinde olmalı.',
    MIN: 'Soyad en az 2 karakter olmalı.',
    MAX: 'Soyad en fazla 75 karakter olmalı.',
    REQUIRED: 'Soyad zorunludur.',
  },
  COMPANY: {
    TYPE: 'Şirket adı metin tipinde olmalı.',
    MIN: 'Şirket adı en az 5 karakter olmalı.',
    MAX: 'Şirket adı en fazla 75 karakter olmalı',
  },
  PHONE: {
    TYPE: 'Cep telefonu numarası metin tipinde olmalı.',
    LENGTH: 'Cep telefonu numarası 10 karakter olmalı.',
    REQUIRED: 'Cep telefonu numarası zorunludur.',
  },
  ADDRESS: {
    TYPE: 'Adres metin tipinde olmalı.',
    MIN: 'Adres en az 5 karakter olmalı.',
    MAX: 'Adres en fazla 255 karakter olmalı',
    REQUIRED: 'Adres zorunludur.',
  },
  DISTRICT: {
    TYPE: 'İlçe dizi tipinde olmalı',
    MIN: 'İlçe en az 2 karakter olmalı.',
    MAX: 'İlçe en fazla 25 karakter olmalı.',
    REQUIRED: 'İlçe zorunludur.',
  },
  CITY: {
    TYPE: 'Şehir dizi tipinde olmalı',
    MIN: 'Şehir en az 2 karakter olmalı.',
    MAX: 'Şehir en fazla 35 karakter olmalı.',
    REQUIRED: 'Şehir zorunludur.',
  },
  POSTALCODE: {
    TYPE: 'Posta kodu dizi tipinde olmalıdır.',
    LENGTH: 'Posta Kodu  5 karakter olmalı.',
    REQUIRED: 'Posta Kodu zorunludur.',
  },
  CAPTCHA: { REQUIRED: 'Lütfen doğrulamayı tamamlayın' },
} as const;

export default messages;
