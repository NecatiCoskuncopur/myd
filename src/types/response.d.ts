declare namespace ResponseTypes {
  interface IActionResponse<T = undefined> {
    status: 'OK' | 'ERROR';
    data?: T;
    message?: string;
  }
}
