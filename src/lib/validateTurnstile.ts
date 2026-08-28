type TurnstileResponse = {
  success: boolean;
  'error-codes'?: string[];
};

export const validateTurnstile = async (token: string) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey || !token) {
    return false;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
    }),
    cache: 'no-store',
  });

  const data = (await response.json()) as TurnstileResponse;

  return data.success;
};
