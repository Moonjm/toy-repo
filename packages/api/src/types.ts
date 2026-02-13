export interface DataResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  code: string;
  error: string;
  timestamp: string;
}

export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiClientConfig {
  baseURL: string;
  refreshTokenURL?: string;
  onUnauthorized?: () => void;
}
