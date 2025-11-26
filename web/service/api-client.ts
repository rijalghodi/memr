import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

import { removeAuthCookie, setAuthCookie } from "@/lib/auth-cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/lib/constant";

import { authApi } from "./api-auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get(ACCESS_TOKEN_KEY);
    // Add auth token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry refresh token endpoint itself
      if (originalRequest.url?.includes("/v1/auth/refresh-token")) {
        // Refresh token failed, remove auth cookies and reject
        if (typeof window !== "undefined") {
          removeAuthCookie();
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token available, remove auth cookies and reject
        if (typeof window !== "undefined") {
          removeAuthCookie();
        }
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await authApi.refreshToken({ refreshToken });

        if (response?.data) {
          const {
            accessToken,
            refreshToken: newRefreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
          } = response.data;

          // Update cookies with new tokens
          if (typeof window !== "undefined") {
            setAuthCookie({
              accessToken,
              refreshToken: newRefreshToken,
              accessTokenExpires: accessTokenExpiresAt,
              refreshTokenExpires: refreshTokenExpiresAt,
            });
          }

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Process queued requests
          processQueue(null, accessToken);
          isRefreshing = false;

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error("Invalid refresh token response");
        }
      } catch (refreshError) {
        // Refresh failed, remove auth cookies and reject
        if (typeof window !== "undefined") {
          removeAuthCookie();
        }
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
