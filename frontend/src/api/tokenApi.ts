import api from "./axiosInstance";

// Create Token
export interface CreateTokenRequest {
  expirationTime?: number;
}

export interface CreateTokenResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string | null;
  };
}

// Revoke Token
export interface RevokeTokenRequest {
  token: string;
}

export interface RevokeTokenResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string | null;
  };
}

// Get token details
export interface TokenDetailsRequest {
  token: string;
}

export interface TokenDetailsResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string | null;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}

// Paginate Tokens
export interface PaginateTokensRequest {
  page: number;
  limit: number;
  query?: string;
}

export interface Token {
  id: string;
  token: string;
  userId: string;
  expiresAt: string | null;
}

export interface PaginateTokensResponse {
  success: boolean;
  message: string;
  data: Token[];
  meta: {
    total: number;
    page: number;
    limit: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export const tokenApi = {
  createToken: async (request: CreateTokenRequest) => {
    const { data } = await api.post<CreateTokenResponse>("/token/create", {
      ...request,
    });
    return data;
  },
  revokeToken: async (request: RevokeTokenRequest) => {
    const { data } = await api.delete<RevokeTokenResponse>(
      `/token/revoke/${request.token}`,
    );
    return data;
  },
  getTokenDetails: async (request: TokenDetailsRequest) => {
    const { data } = await api.get<TokenDetailsResponse>(
      `/token/details/${request.token}`,
    );
    return data;
  },
  paginateTokens: async (request: PaginateTokensRequest) => {
    const { data } = await api.post<PaginateTokensResponse>("/token/paginate", {
      ...request,
    });
    return data;
  },
};
