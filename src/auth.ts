import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ValidationError } from 'yup';

import { AUTH_TOKEN_TTL_SECONDS, authMessages, DUMMY_PASSWORD_HASH, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import LoginError from '@/lib/loginError';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { User } from '@/models';
import loginSchema from '@/schemas/login.schema';

export const {
  handlers,
  auth,
  signIn: authSignIn,
  signOut: authSignOut,
} = NextAuth({
  secret: env.AUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: AUTH_TOKEN_TTL_SECONDS,
  },

  providers: [
    Credentials({
      credentials: {
        email: {
          type: 'email',
        },
        password: {
          type: 'password',
        },
        recaptchaToken: {
          type: 'text',
        },
      },

      async authorize(credentials) {
        let validatedData;

        try {
          validatedData = await loginSchema.validate(credentials, {
            abortEarly: false,
            stripUnknown: true,
          });
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new LoginError(error.errors.join(', '));
          }

          throw error;
        }

        const captchaResult = await validateRecaptcha(validatedData.recaptchaToken);

        if (!captchaResult.success) {
          throw new LoginError(captchaResult.message);
        }

        await connectMongoDB();

        const email = validatedData.email.trim().toLowerCase();

        const user = await User.findOne({
          email,
        }).select('_id email role isActive +password');

        const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;

        const isCorrectPassword = await bcrypt.compare(validatedData.password, passwordHash);

        if (!user || !isCorrectPassword) {
          throw new LoginError(authMessages.INVALID_CREDENTIALS);
        }

        if (!user.isActive) {
          throw new LoginError(userMessages.DEACTIVATED);
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      if (session.user && token.role) {
        session.user.role = token.role;
      }

      return session;
    },
  },
});
