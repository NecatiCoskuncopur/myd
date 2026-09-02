const env = {
  PASSWORD_RESET_SECRET: process.env.PASSWORD_RESET_SECRET!,
  FRONT_URL: process.env.FRONT_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  FEDEX_TRACKING_API_KEY: process.env.FEDEX_TRACKING_API_KEY!,
  FEDEX_TRACKING_SECRET_KEY: process.env.FEDEX_TRACKING_SECRET_KEY!,
};

if (!env.PASSWORD_RESET_SECRET) {
  throw new Error('PASSWORD_RESET_SECRET environment variable is not defined');
}

if (!env.FRONT_URL) {
  throw new Error('FRONT_URL environment variable is not defined');
}

if (!env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is not defined');
}

if (!env.FEDEX_TRACKING_API_KEY || !env.FEDEX_TRACKING_SECRET_KEY)
  throw new Error('FEDEX_TRACKING_API_KEY and FEDEX_TRACKING_SECRET_KEY environment variables are not defined');

export default env;
