import type { AxiosRequestConfig } from 'axios';

// API 클라이언트 타입 정의
export interface ApiClient {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
}

// API 설정 타입
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// 타입 안전한 API 응답 타입
export type ApiResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
};
