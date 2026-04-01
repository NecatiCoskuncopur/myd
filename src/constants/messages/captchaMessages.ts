const captchaMessages = {
  SECRET_MISSING: 'Captcha secret bilgisi eksik.',
  TOKEN_MISSING: 'Captcha token bilgisi eksik.',
  INVALID: 'Geçersiz Captcha!',
  SERVER_ERROR: 'Captcha doğrulama sunucusundan yanıt alınamadı.',
  REQUIRED: 'Lütfen doğrulama işlemini tamamlayın',
} as const;

export default captchaMessages;
