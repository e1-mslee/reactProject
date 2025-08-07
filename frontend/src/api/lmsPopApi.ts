import { apiClient } from './api';

// LmsPop 관련 타입 정의
export interface CommCode {
  COM_CD: string;
  COM_CD_NM: string;
}

export interface GridInfo {
  TABLE_NAME: string;
  TABLE_ID: string;
  TABLE_SEQ: string;
}

export interface GridItem {
  selected?: boolean;
  COL_ID?: string;
  COL_NAME?: string;
  COL_NM?: string;
  COL_TYPE?: string;
  COL_SIZE?: number | null;
  COL_IDX?: boolean;
  COL_SCH?: boolean;
  TABLE_SEQ?: string;
  STATUS?: 'INS' | 'UPD' | 'DEL';
}

export interface DeleteItem {
  COL_ID: string;
  TABLE_SEQ: string;
}

// LmsPop API 함수들
export const lmsPopApi = {
  // 공통코드 조회
  getCommCodes: async (): Promise<CommCode[]> => {
    try {
      const result: CommCode[] = await apiClient.get<CommCode[]>('/api/commCode');
      return result;
    } catch (error: unknown) {
      console.error('공통코드 조회 실패:', error);
      throw error;
    }
  },

  // 테이블 필드 목록 조회
  getTableFieldList: async (tableSeq: string): Promise<GridItem[]> => {
    try {
      const result: GridItem[] = await apiClient.post<GridItem[]>('/api/getTableFieldList', tableSeq);
      return result;
    } catch (error: unknown) {
      console.error('테이블 필드 목록 조회 실패:', error);
      throw error;
    }
  },

  // 메인 테이블 정보 조회
  getMainTableInfoData: async (tableSeq: string): Promise<GridInfo[]> => {
    try {
      const result: GridInfo[] = await apiClient.post<GridInfo[]>('/api/getMainTableInfoData', tableSeq);
      return result;
    } catch (error: unknown) {
      console.error('메인 테이블 정보 조회 실패:', error);
      throw error;
    }
  },

  // 메인 테이블 정보 저장
  saveMainTableInfo: async (data: GridInfo[]): Promise<void> => {
    try {
      await apiClient.post('/api/saveMainTableInfo', data);
    } catch (error: unknown) {
      console.error('메인 테이블 정보 저장 실패:', error);
      throw error;
    }
  },

  // 테이블 필드 목록 저장
  saveTableFieldList: async (data: GridItem[]): Promise<void> => {
    try {
      await apiClient.post('/api/saveTableFieldList', data);
    } catch (error: unknown) {
      console.error('테이블 필드 목록 저장 실패:', error);
      throw error;
    }
  },

  // 테이블 필드 삭제
  deleteTableField: async (data: DeleteItem[]): Promise<void> => {
    try {
      await apiClient.post('/api/deleteTableField', data);
    } catch (error: unknown) {
      console.error('테이블 필드 삭제 실패:', error);
      throw error;
    }
  },
};

export default lmsPopApi;
