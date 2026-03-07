import api from "./axiosInstance";

export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  applicationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  subject: string;
  body: string;
}

export interface CreateTemplateResponse {
  success: boolean;
  message: string;
  data: Template;
}

// Remove doesn't have an interface for a request but has a response interface
export interface RemoveTemplateResponse {
  success: boolean;
  message: string;
  data: Template;
}

// Partial interface from CreateTemplateRequest (inherits all the fields but all are optional)
export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}
export interface UpdateTemplateResponse {
  success: boolean;
  message: string;
  data: Template;
}

export interface GetTemplateDetailsResponse {
  success: boolean;
  message: string;
  data: Template;
}

export interface PaginateTemplatesRequest {
  page: number;
  limit: number;
  query: string;
}

export interface PaginateTemplatesResponse {
  success: boolean;
  message: string;
  data: Template[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export interface ActivateTemplateResponse {
  success: boolean;
  message: string;
  data: Template;
}

export const templateApi = {
  createTemplate: async (
    applicationId: string,
    request: CreateTemplateRequest,
  ) => {
    const { data } = await api.post<CreateTemplateResponse>(
      `/template/create/${applicationId}`,
      request,
    );
    return data;
  },
  removeTemplate: async (templateId: string) => {
    const { data } = await api.delete<RemoveTemplateResponse>(
      `/template/remove/${templateId}`,
    );
    return data;
  },
  updateTemplate: async (
    templateId: string,
    request: UpdateTemplateRequest,
  ) => {
    const { data } = await api.patch<UpdateTemplateResponse>(
      `/template/update/${templateId}`,
      request,
    );
    return data;
  },
  getTemplateDetails: async (templateId: string) => {
    const { data } = await api.get<GetTemplateDetailsResponse>(
      `/template/details/${templateId}`,
    );
    return data;
  },
  paginateTemplates: async (
    applicationId: string,
    request: PaginateTemplatesRequest,
  ) => {
    const { data } = await api.get<PaginateTemplatesResponse>(
      `/template/paginate/${applicationId}`,
      { params: request }, // Pass the pagination parameters as query parameters
    );
    return data;
  },
  activateTemplate: async (templateId: string) => {
    const { data } = await api.patch<ActivateTemplateResponse>(
      `/template/activate/${templateId}`,
    );
    return data;
  },
};
