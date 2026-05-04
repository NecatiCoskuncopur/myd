declare namespace ResponseTypes {
  interface IActionResponse<T = undefined> {
    status: 'OK' | 'ERROR';
    data?: T;
    message?: string;
  }

  interface IPaginationResponse {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  }
}
