export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  search?: string;
  page?: number | string;
  per_page?: number | string;
  sort?: string;
  order?: 'asc' | 'desc';
  select?: string;
  [key: string]: any;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  type: 'Bearer';
  expiresIn: number;
}

export interface LoginResponse extends AuthTokens {
  // A resposta do login retorna os tokens diretamente no nível raiz
}
