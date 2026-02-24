interface IActionResponse<T = undefined> {
  status: 'OK' | 'ERROR';
  data?: T;
  message?: string;
}

interface IForgotPasswordPayload {
  email: string;
}

interface IResetPasswordPayload {
  newPassword: string;
  token: string;
}
