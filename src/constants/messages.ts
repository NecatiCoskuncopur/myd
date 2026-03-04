const messages = {
  BALANCE: {
    ERROR: 'Bakiye işlenirken hata oluştu!',
    INVALID: 'Bakiye işlem tipi geçersiz.',
    NOT_FOUND: 'Bakiye bulunamadı',
  },
  GENERAL: {
    UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu',
    UNAUTHORIZED: 'Yetkisiz işlem',
  },
} as const;

export default messages;
