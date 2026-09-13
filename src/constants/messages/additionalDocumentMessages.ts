const additionalDocumentMessages = {
  FILE: {
    REQUIRED: 'Belge zorunludur.',
    TYPE_INVALID: 'Desteklenmeyen dosya tipi.',
    SIZE: 'Dosya boyutu en fazla 1 MB olabilir.',
  },
  DOCUMENT_TYPE: {
    INVALID: 'Geçersiz belge tipi.',
    REQUIRED: 'Belge tipi zorunludur.',
  },
  ID: {
    INVALID: 'Geçersiz belge ID.',
    NOT_FOUND: 'Belge bulunamadı.',
  },
  DELETE: {
    SUCCESS: 'Belge başarıyla silindi.',
  },
} as const;

export default additionalDocumentMessages;
