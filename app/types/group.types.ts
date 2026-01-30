export interface Group {
  id: number;
  name: string;
}

export interface GroupListParams {
  page?: number;
  limit?: number;
  search?: string;
}
