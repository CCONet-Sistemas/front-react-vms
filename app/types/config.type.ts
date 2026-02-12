export interface Configuration {
  key: {
    value: string;
  };
  value: {
    rawValue: string | number | boolean | Record<string, unknown>;
    type: 'string' | 'number' | 'boolean' | 'json';
  };
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigDto {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateConfigDto = Partial<CreateConfigDto>;

export interface ConfigListResponse {
  data: Configuration[];
  meta: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

export interface ConfigListParams {
  page?: number;
  itemsPerPage?: number;
  search?: string;
}
