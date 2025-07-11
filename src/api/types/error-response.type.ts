export interface BackendErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export const DEFAULT_ERROR_MSG =
  'An unexpected error occurred. Please try again later.';
