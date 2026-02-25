import type { SearchParams } from './api.types';

export interface Group {
  id: number;
  name: string;
}

export type GroupListParams = SearchParams;
