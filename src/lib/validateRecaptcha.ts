/**
 * hCaptcha token doğrulaması yapar
 *
 * Bu fonksiyon hCaptcha `/siteverify` endpointine istek atar
 * ve token'ın geçerli olup olmadığını kontrol eder.
 *
 * @param token - Client tarafından alınan hCaptcha token
 *
 * @returns Promise<{ success: true } | { success: false; message: string }>
 *
 */
const validateRecaptcha = async (token: string): Promise<{ success: true } | { success: false; message: string }> => {
  const secret = process.env.HCAPTCHA_SECRET;

  if (!secret) {
    return { success: false, message: 'HCAPTCHA_SECRET missing' };
  }

  if (!token) {
    return { success: false, message: 'Captcha token missing' };
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  });

  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    return { success: false, message: 'hCaptcha server error' };
  }

  const data = await res.json();

  if (!data.success) {
    return { success: false, message: 'Invalid hCaptcha' };
  }

  return { success: true };
};

export default validateRecaptcha;
