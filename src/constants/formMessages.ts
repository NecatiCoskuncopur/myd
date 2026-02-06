const formMessages = {
  required: {
    email: 'E-posta adresi zorunludur.',
    password: 'Şifre alanı zorunludur.',
    firstName: 'Ad alanı zorunludur.',
    lastName: 'Soyad alanı zorunludur',
    captcha: 'Lütfen doğrulamayı tamamlayın',
    phone: 'Telefon numarası zorunludur.',
    address: 'Adres boş bırakılamaz.',
    district: 'İlçe boş bırakılamaz.',
    city: 'İl boş bırakılamaz.',
    postalCode: 'Posta kodu boş bırakılamaz',
    newPassword: 'Yeni parola zorunludur.',
    newPasswordRepeat: 'Şifreler aynı değil, lütfen tekrar girin.',
  },
  valid: {
    email: 'Geçerli bir e-posta adresi giriniz.',
  },
  minLength: {
    firstName: 'Ad en az 2 karakter olmalıdır.',
    lastName: 'Soyad en az 2 karakter olmalıdır',
    password: 'Şifre en az 8 karakterden az olamaz.',
  },
  maxLength: {
    password: 'Şifre 255 karakteri aşmamalıdır.',
  },
};

export default formMessages;
