import { apiClient } from '@api/api';
import type { AxiosError, AxiosResponse } from 'axios';

interface RefreshResponse {
  accessToken: string;
}

export const AuthApi = {
  refreshToken: async (): Promise<string | null> => {
    try {
      const refreshRes: AxiosResponse<RefreshResponse> = await apiClient.post(
        '/refresh',
        {},
        { withCredentials: true } // 쿠키 기반 refresh
      );

      const accessToken = refreshRes.data.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        return accessToken; // ✅ 호출한 쪽에서 바로 사용 가능
      }
      return null;
    } catch (err) {
      const error = err as AxiosError;
      console.error('Refresh token failed:', error.message);
      return null; // ✅ 실패하면 null 반환
    }
  },
};

export default AuthApi;
