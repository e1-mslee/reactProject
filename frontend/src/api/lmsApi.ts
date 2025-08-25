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

export const lmsApi = {
  // 메인 테이블 정보 조회
  getMainTableInfo: async (condition: SearchCondition): Promise<TableInfo[]> => {
    try {
      const result: TableInfo[] =
        (await apiClient.get<TableInfo[]>('/api/getMainTableInfo', { params: condition })) || [];
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

  fetchDocDown: async (tableSeq: string): Promise<void> => {
    try {
      const response: Blob = await apiClient.get(`/api/fetchDocDown/${tableSeq}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document_form_${tableSeq}.xlsx`); // 파일명 설정
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      // 메모리 해제
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      console.error('문서양식 다운로드 실패:', error);
      throw error;
    }
  },
};

export default lmsApi;
