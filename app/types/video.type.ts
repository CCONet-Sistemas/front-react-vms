export interface Video {
  id: number;
  uuid: string;
  cameraId: string;
  createdAt: string;
  format: string;
  groupKey: string;
  height: number;
  originalFileName: string;
  path: string;
  size: string;
  updatedAt: string;
  width: number;
}

export interface VideoDetail {
  url: string;
  fileName: string;
  size: string;
  createdAt: string;
}

import type { PaginatedResponse } from './api.types';

export type VideoListResponse = PaginatedResponse<Video>;
