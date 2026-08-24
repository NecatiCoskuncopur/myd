import { CredentialsSignin } from 'next-auth';

class LoginError extends CredentialsSignin {
  code = 'credentials';

  constructor(public readonly userMessage: string) {
    super();
  }
}

export default LoginError;
