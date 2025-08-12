import { apiClient } from '@api/api';

export interface HeaderItem {
  selected: boolean;
  HEADER_ID: string;
  HEADER_NAME: string;
  SUPI_HEADER: string;
  HEADER_WIDTH: number | null;
  CONN_FIELD: string;
  SORT_SN: number | null;
  TABLE_SEQ: string | number;
  deps: HeaderItem[];
  STATUS?: 'ADD' | 'UPD' | 'DEL';
}

export interface TableField {
  COL_ID: string;
  COL_NAME: string;
}

export interface SaveHeaderItem extends HeaderItem {
  STATUS: 'ADD' | 'UPD' | 'DEL';
}

export const lmsHeaderApi = {
  getHeaderList: async (tableSeq: string): Promise<HeaderItem[]> => {
    try {
      return await apiClient.get<HeaderItem[]>('/api/getHeaderList', { params: { tableSeq } });
    } catch (error: unknown) {
      console.error('헤더 목록 조회 실패:', error);
      throw error;
    }
  },

  getTableFieldList: async (tableSeq: string): Promise<TableField[]> => {
    try {
      return await apiClient.get<TableField[]>('/api/getTableFieldList', { params: { tableSeq } });
    } catch (error: unknown) {
      console.error('필드 목록 조회 실패:', error);
      throw error;
    }
  },

  saveHeaderList: async (items: SaveHeaderItem[]): Promise<void> => {
    try {
      await apiClient.post('/api/saveHeaderList', items);
    } catch (error: unknown) {
      console.error('헤더 저장 실패:', error);
      throw error;
    }
  },
};

export default lmsHeaderApi;
