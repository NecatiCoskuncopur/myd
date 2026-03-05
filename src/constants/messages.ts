const messages = {
  ADDRESS: {
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
  },
  AUTH: {
    INVALID_CREDENTIALS: 'E-posta adresi veya parola hatalı!',
    TOKEN_GENERATION_FAILED: 'Giriş jetonu üretilirken hata oluştu!',
    SIGNOUT_ERROR: 'Çıkış yapılırken bir hata oluştu',
    INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
    SIGNUP_SUCCESS: 'Kayıt işlemi başarılı',
    RESET_PASSWORD_SUCCESS: 'Şifre başarıyla değiştirildi.',
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
  PASSWORD: {
    TYPE: 'Parola metin tipinde olmalı.',
    MIN: 'Parola en az 8 karakter olmalı.',
    MAX: 'Parola en fazla 255 karakter olmalı.',
    REQUIRED: 'Parola zorunludur.',
    REPEAT: 'Lütfen parolanızı tekrar girin.',
    CURRENT_INVALID: 'Mevcut parola yanlış.',
    SAME_AS_OLD: 'Yeni parola eskisiyle aynı olamaz.',
    DO_NOT_MATCH: 'Parolalar eşleşmiyor',
    SUCCESS: 'Parolanız başarıyla güncellendi.',
  },
  PRICE: {
    NOT_FOUND: 'Fiyat bulunamadı.',
  },
  PRICING: {
    NOT_FOUND: 'Fiyatlandırma bulunamadı.',
    USER_NOT_FOUND: 'Fiyatlandırma kullanıcısı bulunamadı',
  },
  ICINGLIST: {
    NOT_FOUND: 'Fiyat listesi bulunamadı',
    USER_LIST_UNDEFINED: 'Kullanıcı fiyat listesi tanımlı değil',
  },
  TOKEN: {
    TYPE: 'Token metin tipinde olmalı',
    REQUIRED: 'Token zorunludur.',
  },
  USER: {
    EXIST: 'Kullanıcı zaten mevcut.',
    NOT_FOUND: 'Kullanıcı bulunamadı.',
    SUCCESS: 'Kullanıcı başarıyla güncellendi.',
    EMAIL: {
      TYPE: 'E-Posta adresi metin tipinde olmalı.',
      INVALID: 'E-Posta adresi geçersiz',
      REQUIRED: 'E-Posta adresi zorunludur.',
      EXIST: 'Bu E-Posta adresi zaten kayıtlı!',
    },
    COMPANY: {
      TYPE: 'Şirket adı metin tipinde olmalı.',
      MIN: 'Şirket adı en az 5 karakter olmalı.',
      MAX: 'Şirket adı en fazla 75 karakter olmalı',
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
    PHONE: {
      TYPE: 'Cep telefonu numarası metin tipinde olmalı.',
      LENGTH: 'Cep telefonu numarası 10 karakter olmalı.',
      REQUIRED: 'Cep telefonu numarası zorunludur.',
    },
  },
  SHIPPING: {
    INVALID_STATS_TYPE: 'Geçersiz istatistik türü.',
  },
} as const;

export default messages;
