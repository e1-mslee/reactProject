import { apiClient } from '@api/api';

// LMS 관련 API 타입 정의
export interface TableInfo {
  TABLE_SEQ: string;
  TABLE_NAME: string;
  TABLE_ID: string;
  field_count: string;
  VBG_CRE_USER: string;
  VBG_CRE_DTM: string;
  selected?: boolean;
}

export interface SearchCondition {
  startDate: string;
  endDate: string;
}

// LMS API 함수들
export const lmsApi = {
  // 메인 테이블 정보 조회
  getMainTableInfo: async (condition: SearchCondition): Promise<TableInfo[]> => {
    try {
      const result: TableInfo[] = await apiClient.post<TableInfo[]>('/api/getMainTableInfo', condition);
      return result;
    } catch (error: unknown) {
      console.error('메인 테이블 정보 조회 실패:', error);
      throw error;
    }
  },

  // 메인 테이블 정보 저장
  saveMainTableInfo: async (data: TableInfo[]): Promise<void> => {
    try {
      await apiClient.post('/api/saveMainTableInfo', data);
    } catch (error: unknown) {
      console.error('메인 테이블 정보 저장 실패:', error);
      throw error;
    }
  },

  // 메인 테이블 정보 삭제
  deleteMainTableInfo: async (seqList: string[]): Promise<void> => {
    try {
      await apiClient.post('/api/deleteMainTableInfo', seqList);
    } catch (error: unknown) {
      console.error('메인 테이블 정보 삭제 실패:', error);
      throw error;
    }
  },
};

export default lmsApi;
