import type { AxiosError } from "axios";

type SortDir = "asc" | "desc";

type CResponse<T> = {
  // C means Common
  success: boolean;
  status: number;
  message: string;
  code: string;
  errors?: any[];
} & T;

type GResponse<T> = CResponse<{ data?: T }>;
// G means Global

type MResponse<T> = CResponse<{
  data?: T[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  from: number;
  to: number;
}>;

type MRequest<SortByValue = string> = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: SortByValue;
  order?: SortDir;
};

type ValidationError = {
  field: string;
  message: string;
};

type RestErrorResponse = {
  message: string;
  // errors: ValidationError[];
  errors: Record<string, string[]>;
};

type GErrorResponse = AxiosError<RestErrorResponse>;
// G menas Global

export type {
  CResponse,
  GErrorResponse,
  GResponse,
  MRequest,
  MResponse,
  RestErrorResponse,
  SortDir,
  ValidationError,
};
