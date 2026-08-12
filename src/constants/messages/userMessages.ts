const userMessages = {
  EXIST: 'Kullanıcı zaten mevcut.',
  NOT_FOUND: 'Kullanıcı bulunamadı.',
  DEACTIVATED: 'Hesabınız askıya alınmıştır.',
  BARCODE_PERMITS: {
    INVALID: 'Barkod izni geçersiz.',
  },
  COMPANY: {
    TYPE: 'Şirket adı metin tipinde olmalı.',
    MIN: 'Şirket adı en az 5 karakter olmalı.',
    MAX: 'Şirket adı en fazla 75 karakter olmalı',
  },
  NICKNAME: {
    TYPE: 'Kullanıcı adı metin tipinde olmalı.',
    MIN: 'Kullanıcı adı en az 4 karakter olmalı.',
    MAX: 'Kullanıcı adı en fazla 75 karakter olmalı',
  },
  EMAIL: {
    TYPE: 'E-Posta adresi metin tipinde olmalı.',
    INVALID: 'E-Posta adresi geçersiz',
    REQUIRED: 'E-Posta adresi zorunludur.',
    EXIST: 'Bu E-Posta adresi zaten kayıtlı!',
  },
  FIRSTNAME: {
    TYPE: 'Ad metin tipinde olmalı.',
    MIN: 'Ad en az 2 karakter olmalı.',
    MAX: 'Ad en fazla 75 karakter olmalı.',
    REQUIRED: 'Ad zorunludur.',
  },
  ISACTIVE: {
    TYPE: 'Kullanıcı aktiflik değeri boolean formatında olmalıdır',
    REQUIRED: 'Kullanıcı aktiflik değeri zorunludur.',
  },
  LASTNAME: {
    TYPE: 'Soyad metin tipinde olmalı.',
    MIN: 'Soyad en az 2 karakter olmalı.',
    MAX: 'Soyad en fazla 75 karakter olmalı.',
    REQUIRED: 'Soyad zorunludur.',
  },
  PASSWORD: {
    TYPE: 'Parola metin tipinde olmalı.',
    MIN: 'Parola en az 8 karakter olmalı.',
    MAX: 'Parola en fazla 255 karakter olmalı.',
    REQUIRED: 'Parola zorunludur.',
    REPEAT: 'Lütfen parolanızı tekrar girin.',
    CURRENT_INVALID: 'Mevcut parola yanlış.',
    SAME_AS_OLD: 'Yeni parola eskisiyle aynı olamaz.',
    DO_NOT_MATCH: 'Parolalar eşleşmiyor.',
    SUCCESS: 'Parolanız başarıyla güncellendi.',
  },
  PHONE: {
    TYPE: 'Cep telefonu numarası metin tipinde olmalı.',
    MIN: 'Cep telefonu numarası en az 2 karakter olmalı.',
    MAX: 'Cep telefonu numarası en fazla 20 karakter olmalı.',
    LENGTH: 'Cep telefonu numarası 10 karakter olmalı.',
    REQUIRED: 'Cep telefonu numarası zorunludur.',
    INVALID: 'Cep telefonu numarası 5 ile başlamalı ve 10 hane olmalıdır',
  },
  ROLE: {
    INVALID: 'Kullanıcı rolü geçersiz.',
    REQUIRED: 'Kullanıcı rolü zorunludur.',
  },
  TOKEN: {
    TYPE: 'Token metin tipinde olmalı',
    REQUIRED: 'Token zorunludur.',
  },
  EDITUSER: {
    SUCCESS: 'Kullanıcı başarıyla güncellendi.',
  },
} as const;

export default userMessages;
