import { DefaultSession } from 'next-auth';

import { UserRole } from '@/constants';

declare module 'next-auth' {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
  }
}

export {};
