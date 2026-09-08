const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  statusCode: number;
  errorName: string;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errorName: string = 'ApiError', errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorName = errorName;
    this.errors = errors;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.title || response.statusText || 'An unexpected error occurred.';
      const errorTitle = data?.error || 'Error';
      const validationErrors = data?.errors;
      throw new ApiError(errorMessage, response.status, errorTitle, validationErrors);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network request failed. Ensure backend API is running.';
    throw new ApiError(message, 0, 'NetworkError');
  }
}
