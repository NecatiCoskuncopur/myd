const env = {
  PASSWORD_RESET_SECRET: process.env.PASSWORD_RESET_SECRET!,
  FRONT_URL: process.env.FRONT_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
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


export default env;
