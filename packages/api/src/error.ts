import type { ErrorResponse } from './types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly response?: ErrorResponse;

  constructor(status: number, message: string, code?: string, response?: ErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code ?? `HTTP_${status}`;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isBadRequest(): boolean {
    return this.status === 400;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let errorResponse: ErrorResponse | undefined;
    let message = response.statusText || `HTTP Error ${response.status}`;
    let code: string | undefined;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorResponse = (await response.json()) as ErrorResponse;
        message = errorResponse.message || message;
        code = errorResponse.code;
      }
    } catch {
      // ignore
    }

    return new ApiError(response.status, message, code, errorResponse);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
