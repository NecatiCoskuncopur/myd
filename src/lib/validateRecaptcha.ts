import { captchaMessages } from '@/constants';

type ValidateCaptchaResult = { success: true } | { success: false; message: string };

/**
 * hCaptcha doğrulaması yapar ve kullanıcı girişinin geçerli olup olmadığını kontrol eder.
 *
 * - `token` parametresi kullanıcı formundan alınan captcha token olmalıdır.
 * - `ip` parametresi opsiyonel olup, doğrulama sırasında kullanıcı IP'si olarak kullanılabilir.
 * - Fonksiyon, doğrulama başarılıysa `{ success: true }`, başarısızsa `{ success: false; message: string }` döner.
 *
 * @param token - Kullanıcının captcha token'ı
 * @param ip - (Opsiyonel) Kullanıcının IP adresi
 * @returns Doğrulama sonucu: başarı durumu ve hata mesajı (varsa)
 */

const validateRecaptcha = async (token: string, ip?: string): Promise<ValidateCaptchaResult> => {
  const secret = process.env.HCAPTCHA_SECRET;

  if (!secret) {
    return { success: false, message: captchaMessages.SECRET_MISSING };
  }

  if (!token) {
    return { success: false, message: captchaMessages.TOKEN_MISSING };
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  });

  if (ip) {
    params.append('remoteip', ip);
  }

  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    return { success: false, message: captchaMessages.SERVER_ERROR };
  }

  const data: { success: boolean } = await res.json();

  if (!data.success) {
    return { success: false, message: captchaMessages.INVALID };
  }

  return { success: true };
};

export default validateRecaptcha;
