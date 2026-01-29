import type { PaginatedResponse, PaginationParams } from './api.types';

export type EventStatus = 'new' | 'viewed' | 'acknowledged';

export type EventVideoStatus = 'ready' | 'processing' | 'error' | 'pending';

export interface EventVideo {
  uuid: string;
  fileName: string;
  path: string;
  status: EventVideoStatus;
  size: string;
  duration: number | null;
}

export interface EventDetails {
  events: unknown[];
  filetime: string;
  originalThumb: string;
  originalFilename: string;
}

export interface Event {
  uuid: string;
  cameraUuid: string;
  cameraName: string;
  status: EventStatus;
  reason: string;
  confidence: number;
  timestamp: string;
  videos: EventVideo[];
  createdAt: string;
}

export interface EventFilters {
  search?: string;
  status?: EventStatus;
  cameraUuid?: string;
  startDate?: string;
  endDate?: string;
}

export interface EventListParams extends PaginationParams, EventFilters {}

export type EventListResponse = PaginatedResponse<Event>;

export interface UpdateEventStatusDto {
  status: EventStatus;
}
