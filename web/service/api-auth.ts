import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

export type GoogleOAuthReq = {
  idToken: string;
};

export type GoogleOAuthRes = {
  accessToken: string;
  accessTokenExpiresAt: string;
  createdAt: string;
  email: string;
  id: string;
  isVerified: boolean;
  name: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  updatedAt: string;
};

export type RefreshTokenReq = {
  refreshToken: string;
};

export type RefreshTokenRes = {
  accessToken: string;
  accessTokenExpiresAt: string;
  createdAt: string;
  email: string;
  id: string;
  isVerified: boolean;
  name: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  updatedAt: string;
};

export type UserRes = {
  id: string;
  email: string;
  name: string;
  googleImage?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GoogleOAuthApiRes = GResponse<GoogleOAuthRes>;
export type RefreshTokenApiRes = GResponse<RefreshTokenRes>;
export type GetCurrentUserApiRes = GResponse<UserRes>;

export const authApi = {
  googleOAuth: async (data: GoogleOAuthReq): Promise<GoogleOAuthApiRes> => {
    const response = await apiClient.post("/v1/auth/google", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<GetCurrentUserApiRes> => {
    const response = await apiClient.get("/v1/auth/me");
    return response.data;
  },

  refreshToken: async (data: RefreshTokenReq): Promise<RefreshTokenApiRes> => {
    const response = await apiClient.post("/v1/auth/refresh-token", data);
    return response.data;
  },
};

export const GET_CURRENT_USER_KEY = "get-current-user";

export const useGoogleOAuth = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GoogleOAuthApiRes) => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoogleOAuthReq) => authApi.googleOAuth(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [GET_CURRENT_USER_KEY],
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useGetCurrentUser = (
  enabled: boolean = true
): UseQueryResult<GetCurrentUserApiRes, GErrorResponse> => {
  return useQuery({
    queryKey: [GET_CURRENT_USER_KEY],
    queryFn: () => authApi.getCurrentUser(),
    enabled,
  });
};

export const useRefreshToken = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: RefreshTokenApiRes) => void;
  onError?: (error: string) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefreshTokenReq) => authApi.refreshToken(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [GET_CURRENT_USER_KEY],
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const authApiHook = {
  useGoogleOAuth,
  useGetCurrentUser,
  useRefreshToken,
};
