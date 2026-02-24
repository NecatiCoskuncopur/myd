const messages = {
  GENERAL: {
    UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'E-posta adresi veya parola hatalı!',
    TOKEN_GENERATION_FAILED: 'Giriş jetonu üretilirken hata oluştu!',
    SIGNOUT_ERROR: 'Çıkış yapılırken bir hata oluştu',
    INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
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
} as const;

export default messages;
