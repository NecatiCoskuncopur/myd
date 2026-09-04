const sysParamMessages = {
  KEY: {
    ALREADY_EXISTS: 'Bu anahtar zaten kayıtlı.',
    MATCH: 'Anahtar sadece büyük harf, rakam ve alt çizgi içerebilir.',
    MIN: 'Anahtar en az 2 karakter olmalıdır.',
    MAX: 'Anahtar en fazla 100 karakter olmalıdır.',
    REQUIRED: 'Anahtar zorunludur.',
    TYPE: 'Anahtar metin tipinde olmalıdır.',
  },
  VALUE: {
    MIN: 'Değer en az 1 karakter olmalıdır.',
    MAX: 'Değer en fazla 1000 karakter olmalıdır.',
    REQUIRED: 'Değer zorunludur.',
    TYPE: 'Değer metin tipinde olmalıdır.',
  },
  CREATE: {
    SUCCESS: 'Sistem parametresi başarıyla oluşturuldu.',
  },
  ID: {
    TYPE: 'Parametre ID metin tipinde olmalıdır.',
    REQUIRED: 'Parametre ID zorunludur.',
  },
  UPDATE: {
    NOT_FOUND: 'Sistem parametresi bulunamadı.',
    SUCCESS: 'Sistem parametresi başarıyla güncellendi.',
  },
} as const;

export default sysParamMessages;
