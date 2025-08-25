import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { ApiClient, ApiConfig } from './types';

// 기본 설정
const apiConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

interface RefreshResponse {
  accessToken: string;
}

// axios 인스턴스 생성
const api: AxiosInstance = axios.create(apiConfig);

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 요청 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url, response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    // 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const { status, data } = error.response;

      if (status === 401) {
        try {
          // refresh 요청 (쿠키 자동 전송)
          const refreshRes = await axios.post<RefreshResponse>(
            `${apiConfig.baseURL}/refresh`,
            {},
            { withCredentials: true }
          );
          const accesstoken = refreshRes.data.accessToken;
          localStorage.setItem('accessToken', accesstoken);

          if (error.config) {
            return api.request({
              ...(error.config as AxiosRequestConfig),
              headers: {
                ...error.config.headers,
                Authorization: `Bearer ${accesstoken}`,
              },
            });
          }
        } catch (refreshError) {
          // refresh 실패 → 로그인 페이지로 이동
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }

      switch (status) {
        case 403:
          // 권한 없음
          console.error('권한이 없습니다.');
          break;
        case 404:
          // 리소스 없음
          console.error('요청한 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          // 서버 오류
          console.error('서버 오류가 발생했습니다.');
          break;
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우 (네트워크 오류)
      console.error('네트워크 오류가 발생했습니다.');
    } else {
      // 요청 설정 중 오류
      console.error('요청 설정 오류:', error.message);
    }

    return Promise.reject(error);
  }
);

// API 클라이언트 헬퍼 함수들
export const apiClient: ApiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.post<T>(url, data, config).then((res) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.put<T>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete<T>(url, config).then((res) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    api.patch<T>(url, data, config).then((res) => res.data),
};

export default api;
