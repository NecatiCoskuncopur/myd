const shippingMessages = {
  ALREADY_LABELED: 'Gönderi zaten etiketlenmiş',
  COUNTRYCODE: {
    TYPE: 'Ülke kodu metin tipinde olmalı',
    LENGTH: 'Ülke kodu 2 karakter olmalıdır.',
    REQUIRED: 'Ülke kodu zorunludur.',
  },
  CONSIGNEE: {
    NAME: {
      TYPE: 'Alıcı adı dizi tipinde olmalıdır.',
      MIN: 'Alıcı adı en az 4 karakter olmalıdır.',
      MAX: 'Alıcı adı en fazla 35 karakter olmalıdır.',
      REQUIRED: 'Alıcı adı zorunludur.',
    },
    NOT_FOUND: 'Alıcı bulunamadı.',
    TAXID: {
      TYPE: 'Vergi numarası metin tipinde olmalıdır.',
      MAX: 'Vergi numarası en fazla 35 karakter olmalıdır.',
      NOT_FOUND: 'Alıcı bulunamadı',
    },
  },
  CREATESHIPPING: {
    SUCCESS: 'Gönderi başarıyla oluşturuldu',
    ERROR: 'Gönderi oluşturulamadı.',
  },
  CURRENCY: {
    REQUIRED: 'Para birimi zorunludur.',
    INVALID: 'Geçersiz para birimi. Sadece USD, EUR veya GBP seçilebilir.',
  },
  DELETE: {
    SUCCESS: 'Göndeeri başarıyla silindi.',
    ERROR: 'Gönderi silinirken hata oluştu.',
  },
  DESCRIPTION: {
    TYPE: 'Açıklama dizi tipinde olmalı',
    MAX: 'Açıklama en fazla 50 karakter olabilir.',
  },
  FREIGHT: {
    MIN: 'Navlun tutarı en az 1 olmalıdır.',
    TYPE: 'Navlun tutarı sayısal olmalıdır.',
  },
  HARMONIZED_CODE_TYPE: 'GTİP / HS kodu dizi tipinde olmalıdır.',
  HEIGHT: {
    REQUIRED: 'YÜkseklik zorunludur',
    TYPE: 'Yükseklik sayısal olmalıdır.',
    MIN: 'Yükseklik en az 0.5 cm olmalıdır.',
    MAX: 'Yükseklik en fazla 500 cm olabilir.',
  },
  ID: {
    INVALID: 'Geçersiz gönderi id.',
    TYPE: 'Gönderi id metin tipinde olmalıdır.',
    REQUIRED: 'Gönderi id zorunludur.',
  },

  IOSSNUMBER: {
    TYPE: 'Ioss numarası dizi tipinde olmalı',
    LENGTH: 'Ioss numarası 12 haneli olmalıdır.',
  },
  LENGTH: {
    REQUIRED: 'Uzunluk zorunludur.',
    TYPE: 'Uzunluk sayısal olmalıdır.',
    MIN: 'Uzunluk en az 0.5 cm olmalıdır.',
    MAX: 'Uzunluk en fazla 500 cm olabilir.',
  },
  NOT_FOUND: 'Gönderi bulunamadı.',
  NUMBEROFPACKAGE: {
    REQUIRED: 'Paket adedi zorunludur.',
    TYPE: 'Paket adedi sayısal olmalıdır.',
    MIN: 'En az 1 paket girilmelidir.',
    MAX: 'En fazla 55 paket girilebilir.',
  },
  PAYOR: {
    CUSTOMS: {
      TYPE_INVALID: 'Gümrük ödeme tipi geçersiz.',
      TYPE_REQUIRED: 'Gümrük ödeme tipi zorunludur.',
    },
    SHIPMENT: {
      TYPE_INVALID: 'Kargo ödeme tipi geçersiz.',
      TYPE_REQUIRED: 'Kargo ödeme tipi zorunludur.',
    },
  },
  PURPOSE: {
    REQUIRED: 'Gönderim amacı zorunludur.',
    INVALID: 'Geçersiz gönderim amacı.',
  },
  PRODUCT: {
    NAME: {
      TYPE: 'Ürün adı dizi tipinde olmalıdır.',
      MIN: 'Ürün adı en az 2 karakter olmalıdır.',
      MAX: 'Ürün adı en fazla 25 karakter olmalıdır.',
      REQUIRED: 'Ürün adı zorunludur.',
    },
    PIECE: {
      TYPE: 'Parça adedi sayısal olmalıdır.',
      MIN: 'Parça sayısı en az 1 olmalıdır.',
      REQUIRED: 'Parça sayısı zorunludur.',
    },
    UNITPRICE: {
      TYPE: 'Birim fiyatı sayısal olmalıdır.',
      REQUIRED: 'Birim fiyatı zorunludur.',
    },
  },
  UPDATESHIPPING: {
    SUCCESS: 'Gönderi başarıyla güncellendi.',
    ERROR: 'Gönderi güncellenemedi.',
  },
  WEIGHT: {
    REQUIRED: 'Ağırlık zorunludur.',
    TYPE: 'Ağırlık sayısal bir değer olmalıdır.',
    MIN: 'Ağırlık en az 0.1 kg olmalıdır.',
  },
  WIDTH: {
    REQUIRED: 'Genişlik zorunludur.',
    TYPE: 'Genişlik sayısal olmalıdır.',
    MIN: 'Genişlik en az 0.5 cm olmalıdır.',
    MAX: 'Genişlik en fazla 500 cm olabilir.',
  },
} as const;

export default shippingMessages;
