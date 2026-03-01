import api from "./axiosInstance";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", credentials);
    return data;
  },

  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
      "/auth/register",
      credentials,
    );
    return data;
  },
};
