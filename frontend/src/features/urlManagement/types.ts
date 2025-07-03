// URL Management types
export interface URL {
  id: string;
  url: string;
  title: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  lastChecked: Date;
  responseTime?: number;
  statusCode?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateURLRequest {
  url: string;
  title: string;
  description?: string;
}

export interface UpdateURLRequest {
  id: string;
  url?: string;
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface URLAnalytics {
  id: string;
  urlId: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  isUp: boolean;
  errorMessage?: string;
}

export interface URLListFilters {
  status?: 'active' | 'inactive' | 'pending' | 'all';
  search?: string;
  sortBy?: 'title' | 'url' | 'lastChecked' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface URLListResponse {
  urls: URL[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
