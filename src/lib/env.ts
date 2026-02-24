export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  FRONT_URL: process.env.FRONT_URL!,
};

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

if (!env.FRONT_URL) {
  throw new Error('FRONT_URL environment variable is not defined');
}
