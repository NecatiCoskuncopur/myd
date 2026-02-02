export async function validateRecaptcha(token: string) {
  const secret = process.env.RE_CAPTCHA_SECRET;

  if (!secret) throw new Error('RE_CAPTCHA_SECRET missing');
  if (!token) throw new Error('Captcha token missing');

  const params = new URLSearchParams({
    secret,
    response: token,
  });

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error('Google captcha server error');
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error('Invalid captcha');
  }

  return true;
}
