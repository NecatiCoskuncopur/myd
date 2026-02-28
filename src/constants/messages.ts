const messages = {
  GENERAL: {
    UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu',
    UNAUTHORIZED: 'Yetkisiz işlem',
    USER_NOT_FOUND: 'Kullanıcı bulunamadı.',
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
    REPEAT: 'Lütfen parolanızı tekrar girin.',
    CURRENT_INVALID: 'Mevcut parola yanlış.',
    SAME_AS_OLD: 'Yeni parola eskisiyle aynı olamaz.',
    DO_NOT_MATCH: 'Parolalar eşleşmiyor',
    SUCCESS: 'Parolanız başarıyla güncellendi.',
  },
  EMAIL: {
    TYPE: 'E-Posta adresi metin tipinde olmalı.',
    INVALID: 'E-Posta adresi geçersiz',
    REQUIRED: 'E-Posta adresi zorunludur.',
    EXIST: 'Bu E-Posta adresi zaten kayıtlı!',
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
    TYPE: 'İlçe metin tipinde olmalı',
    MIN: 'İlçe en az 2 karakter olmalı.',
    MAX: 'İlçe en fazla 25 karakter olmalı.',
    REQUIRED: 'İlçe zorunludur.',
  },
  CITY: {
    TYPE: 'Şehir metin tipinde olmalı',
    MIN: 'Şehir en az 2 karakter olmalı.',
    MAX: 'Şehir en fazla 35 karakter olmalı.',
    REQUIRED: 'Şehir zorunludur.',
  },
  POSTALCODE: {
    TYPE: 'Posta kodu metin tipinde olmalıdır.',
    LENGTH: 'Posta Kodu  5 karakter olmalı.',
    REQUIRED: 'Posta Kodu zorunludur.',
  },
  CAPTCHA: { REQUIRED: 'Lütfen doğrulamayı tamamlayın' },
  PRICINGLIST: {
    NOT_FOUND: 'Fiyat listesi bulunamadı',
    USER_LIST_UNDEFINED: 'Kullanıcı fiyat listesi tanımlı değil',
    TYPE: 'Fiyat listesi dizi tipinde olmalıdır.',
    REQUIRED: 'Fiyat listesi zorunludur.',
  },
  SHIPPINGSTATS: {
    INVALID_TYPE: 'Geçersiz gönderi tipi.',
  },
  EDITUSER: {
    SUCCESS: 'Bilgileriniz başarıyla güncellendi.',
  },
  BALANCE: {
    ERROR: 'Bakiye işlenirken hata oluştu!',
    INVALID: 'Bakiye işlem tipi geçersiz.',
  },
  TRANSACTION: {
    USERID_TYPE: 'Kullanıcı ID değeri string tipinde olmalıdır.',
    USERID_REQUIRED: 'Kullanıcı ID zorunludur.',
    TYPE_INVALID: 'İşlem tipi geçersiz',
    TYPE_REQUIRED: 'İşlem tipi zorunludur.',
    AMOUNT_TYPE: 'İşlem miktarı sayı tipinde olmalıdır.',
    AMOUNT_REQUIRED: 'İşlem miktarı zorunludur.',
    AMOUNT_MIN: 'İşlem miktarı 0.01 den küçük olamaz',
    NOTE_TYPE: 'İşlem notu dizi tipinde olmalı.',
    NOTE_MAX: 'İşlem notu en fazla 35 karakter olmalı.',
  },
  ROLE: {
    INVALID: 'Kullanıcı rolü geçersiz.',
    REQUIRED: 'Kullanıcı rolü zorunludur.',
  },
  ISACTIVE: {
    TYPE: 'Kullanıcı aktiflik değeri boolean formatında olmalıdır',
    REQUIRED: 'Kullanıcı aktiflik değeri zorunludur.',
  },
  BARCODE_PERMITS: {
    INVALID: 'Barkod izni geçersiz.',
  },
  COUNTRY: {
    NOT_FOUND: 'Ülke bulunamadı',
  },
  PRICING: {
    NOT_FOUND: 'Fiyatlandırma bulunamadı.',
  },
  PRICE: {
    NOT_FOUND: 'Fiyat bulunamadı.',
  },
  SHIPPING: {
    NOT_FOUND: 'GÖnderi bulunamadı',
    ALREADY_LABELED: 'Gönderi zaten etiketlenmiş',
  },
} as const;

export default messages;
