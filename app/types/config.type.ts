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

import type { PaginatedResponse, SearchParams } from './api.types';

export type ConfigListResponse = PaginatedResponse<Configuration>;

export type ConfigListParams = SearchParams;
