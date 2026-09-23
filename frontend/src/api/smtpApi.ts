import api from "./axiosInstance";

// Add SMTP Configuration
export interface AddSmtpConfigRequest {
  smtpService: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
}

export interface SmtpConfigData {
  id: string;
  smtpService: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  userId: string;
}

export interface AddSmtpConfigResponse {
  data: SmtpConfigData;
  message: string;
}

// Get All SMTP Configurations
export interface GetAllSmtpConfigsResponse {
  data: SmtpConfigData[];
  message: string;
}

// Update SMTP Configuration
export interface UpdateSmtpConfigRequest {
  smtpService: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
}

export interface UpdateSmtpConfigResponse {
  data: SmtpConfigData;
  message: string;
}

// Delete SMTP Configuration
export interface DeleteSmtpConfigResponse {
  message: string;
}

export const smtpApi = {
  // Add new SMTP configuration
  addSmtpConfig: async (request: AddSmtpConfigRequest) => {
    const { data } = await api.post<AddSmtpConfigResponse>("/smtp/add", {
      ...request,
    });
    return data;
  },

  // Get all SMTP configurations
  getAllSmtpConfigs: async () => {
    const { data } = await api.get<GetAllSmtpConfigsResponse>("/smtp/all");
    return data;
  },

  // Update SMTP configuration
  updateSmtpConfig: async (
    smtpId: string,
    request: UpdateSmtpConfigRequest,
  ) => {
    const { data } = await api.patch<UpdateSmtpConfigResponse>(
      `/smtp/update/${smtpId}`,
      {
        ...request,
      },
    );
    return data;
  },

  // Delete SMTP configuration
  deleteSmtpConfig: async (smtpId: string) => {
    const { data } = await api.delete<DeleteSmtpConfigResponse>(
      `/smtp/delete/${smtpId}`,
    );
    return data;
  },
};
