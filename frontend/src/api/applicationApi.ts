import api from "./axiosInstance";

// Application interface for type safety and better code readability
export interface Application {
  id: string;
  name: string;
  description?: string;
  picture?: string;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  picture?: string;
}

export interface CreateApplicationResponse {
  success: boolean;
  message: string;
}

export interface RemoveApplicationRequest {
  applicationId: string;
}

export interface RemoveApplicationResponse {
  success: boolean;
  message: string;
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {
  applicationId: string;
}

export interface PaginateApplicationsRequest {
  page: number;
  limit: number;
  query: string;
}

export interface PaginateApplicationsResponse {
  success: boolean;
  message: string;
  data: Array<Application>;
  meta: {
    total: 0;
    page: number;
    limit: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export const applicationApi = {
  createApplication: async (request: CreateApplicationRequest) => {
    return await api.post<CreateApplicationResponse>(
      "/application/create",
      request,
    );
  },
  paginateApplications: async (request: PaginateApplicationsRequest) => {
    return await api.get<PaginateApplicationsResponse>(
      `/application/paginate?page=${request.page}&limit=${request.limit}&query=${request.query}`,
    );
  },
  removeApplication: async (request: RemoveApplicationRequest) => {
    return await api.delete<RemoveApplicationResponse>(
      `/application/remove/${request.applicationId}`,
    );
  },
  updateApplication: async (request: UpdateApplicationRequest) => {
    return await api.patch<CreateApplicationResponse>(
      `/application/update/${request.applicationId}`,
      {
        name: request.name,
        description: request.description,
        picture: request.picture,
      },
    );
  },
};
