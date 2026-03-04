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
  AUTH: {
    INVALID_CREDENTIALS: 'E-posta adresi veya parola hatalı!',
    TOKEN_GENERATION_FAILED: 'Giriş jetonu üretilirken hata oluştu!',
    SIGNOUT_ERROR: 'Çıkış yapılırken bir hata oluştu',
    INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
    SIGNUP_SUCCESS: 'Kayıt işlemi başarılı',
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
  EMAIL: {
    TYPE: 'E-Posta adresi metin tipinde olmalı.',
    INVALID: 'E-Posta adresi geçersiz',
    REQUIRED: 'E-Posta adresi zorunludur.',
    EXIST: 'Bu E-Posta adresi zaten kayıtlı!',
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

  PRICING: {
    NOT_FOUND: 'Fiyatlandırma bulunamadı.',
    USER_NOT_FOUND: 'Fiyatlandırma kullanıcısı bulunamadı',
  },
  PRICE: {
    NOT_FOUND: 'Fiyat bulunamadı.',
  },
  TOKEN: {
    TYPE: 'Token metin tipinde olmalı',
    REQUIRED: 'Token zorunludur.',
  },
} as const;

export default messages;
