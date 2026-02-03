export async function validateRecaptcha(token: string) {
  const secret = process.env.HCAPTCHA_SECRET;

  if (!secret) throw new Error('HCAPTCHA_SECRET missing');
  if (!token) throw new Error('Captcha token missing');

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
    throw new Error('hCaptcha server error');
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error('Invalid hCaptcha');
  }

  return true;
}
