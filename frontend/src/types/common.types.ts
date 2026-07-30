export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  message?: string;
}

export interface BaseEntity {
  id: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
