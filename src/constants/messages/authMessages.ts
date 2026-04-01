const authMessages = {
  SIGNOUT: {
    ERROR: 'Çıkış yapılırken bir hata oluştu',
  },
  SIGNUP: {
    ERROR: 'Kayıt sırasında hata oluştu.',
    SUCCESS: 'Kayıt işlemi başarılı,.',
  },
  RESETPASSWORD: {
    ERROR: 'Şifre sıfırlama işlemi başarısız.',
    SUCCESS: 'Şifre başarıyla değiştirildi.',
  },
  FORGOTPASSWORD: {
    ERROR: 'Parola sıfırlama isteği gönderilemedi',
  },
  SIGNIN: {
    ERROR: 'Giriş başarısız.',
  },
  INVALID_CREDENTIALS: 'E-posta adresi veya parola hatalı!',
  TOKEN_GENERATION_FAILED: 'Giriş jetonu üretilirken hata oluştu!',
  INVALID_TOKEN: 'Geçersiz veya süresi dolmuş token',
} as const;

export default authMessages;
