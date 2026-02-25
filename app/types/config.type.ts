export interface Configuration {
  key: string;
  value: string;
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
    current_page: number;
    from: number;
    last_page: number;
    to: number;
    total: number;
    per_page: number;
  };
}

export interface ConfigListParams {
  page?: number;
  per_page?: number;
  search?: string;
}
