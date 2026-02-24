const messages = {
  GENERAL: {
    UNEXPECTED_ERROR: 'Beklenmeyen bir hata oluştu',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'E-posta adresi veya parola hatalı!',
    TOKEN_GENERATION_FAILED: 'Giriş jetonu üretilirken hata oluştu!',
    SIGNOUT_ERROR: 'Çıkış yapılırken bir hata oluştu',
  },
} as const;

export default messages;
