import { apiClient } from '@api/api';

export const lmsDocApi = {
  // 메인 테이블 정보 조회
  getDataList: async (tableSeq: string): Promise<[]> => {
    try {
      const result: [] = await apiClient.get<[]>('/api/getTableDataList', { params: { tableSeq } });
      return result;
    } catch (error: unknown) {
      console.error('메인 테이블 정보 조회 실패:', error);
      throw error;
    }
  },
};

export default lmsDocApi;
