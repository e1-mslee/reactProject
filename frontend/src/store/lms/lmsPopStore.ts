import { create } from 'zustand';
import { CollectionView } from '@mescius/wijmo';
import { DataMap } from '@mescius/wijmo.grid';
import { message } from 'antd';
import lmsPopApi from '@api/lmsPopApi';
import type { CommCode, GridInfo, GridItem, TableCountInfo } from '@api/lmsPopApi';

// 상수 정의
const CONSTANTS = {
  MESSAGES: {
    COL_NAME_REQUIRED: '컬럼명은 필수 입력 항목입니다.',
    COL_TYPE_REQUIRED: '컬럼 타입은 필수 입력 항목입니다.',
    COL_SIZE_REQUIRED: '컬럼 길이는 필수 입력 항목입니다.',
    NO_SELECTED_ROWS: '선택된 행이 없습니다.',
    SAVE_SUCCESS: '저장되었습니다.',
    DELETE_SUCCESS: '삭제되었습니다.',
    SAVE_ERROR: '저장 중 오류가 발생했습니다.',
    DELETE_ERROR: '삭제 중 오류 발생',
    LOAD_ERROR: '데이터 불러오기 오류:',
    TABLE_SAVE_FIRST: '물리 테이블명 저장 후 추가 가능합니다.',
    NO_SAVE_CONTENT: '저장할 내용이 없습니다.',
  },
};

interface LmsPopStoreState {
  // 상태
  flag: boolean;
  initialGridInfo: GridInfo | null;
  gridData: CollectionView<GridItem> | null;
  commCodes: CommCode[];
  gridInfo: GridInfo;
  statusMap: DataMap;
  readOnlyFlag: boolean;

  // 액션
  setFlag: (flag: boolean) => void;
  setInitialGridInfo: (info: GridInfo | null) => void;
  setGridData: (data: CollectionView<GridItem>) => void;
  setCommCodes: (codes: CommCode[]) => void;
  setGridInfo: (info: GridInfo) => void;

  // API 호출 함수
  fetchCommCodes: () => Promise<void>;
  fetchFieldList: (tableSeq: string) => Promise<void>;
  fetchTableInfo: (tableSeq: string) => Promise<void>;
  fetchTableCountInfo: (tableSeq: string) => Promise<void>;
  // 비즈니스 로직 함수
  handleAddRow: (tableSeq: string) => void;
  saveTableInfo: (tableSeq: string) => Promise<void>;
  deleteData: (tableSeq: string) => void;

  // 초기화
  reset: () => void;
}

// 데이터 검증
const validateGridItems = (items: GridItem[]): boolean => {
  for (const item of items) {
    if (!item.COL_NAME) {
      message.error(CONSTANTS.MESSAGES.COL_NAME_REQUIRED);
      return false;
    }

    if (!item.COL_TYPE) {
      message.error(CONSTANTS.MESSAGES.COL_TYPE_REQUIRED);
      return false;
    }

    if (!item.COL_SIZE) {
      message.error(CONSTANTS.MESSAGES.COL_SIZE_REQUIRED);
      return false;
    }
  }
  return true;
};

const isTableCountInfo = (value: unknown): value is TableCountInfo => {
  return typeof value === 'object' && value !== null && 'FLAG' in (value as Record<string, unknown>);
};

export const useLmsPopStore = create<LmsPopStoreState>((set, get) => ({
  // 초기 상태
  flag: false,
  initialGridInfo: null,
  gridData: null,
  readOnlyFlag: false,
  commCodes: [],
  gridInfo: {
    TABLE_NAME: '',
    TABLE_ID: '',
    TABLE_SEQ: '',
  },
  statusMap: new DataMap([], 'COM_CD', 'COM_CD_NM'),

  // 상태 설정 함수들
  setFlag: (flag) => set({ flag }),
  setInitialGridInfo: (info) => set({ initialGridInfo: info }),
  setGridData: (data) => set({ gridData: data }),
  setCommCodes: (codes) =>
    set({
      commCodes: codes,
      statusMap: new DataMap(codes, 'COM_CD', 'COM_CD_NM'),
    }),
  setGridInfo: (info) => set({ gridInfo: info }),

  // API 호출 함수들
  fetchCommCodes: async () => {
    try {
      const codes = await lmsPopApi.getCommCodes();
      set({
        commCodes: codes,
        statusMap: new DataMap(codes, 'COM_CD', 'COM_CD_NM'),
      });
    } catch (err) {
      console.error(CONSTANTS.MESSAGES.LOAD_ERROR, err);
    }
  },

  fetchFieldList: async (tableSeq: string) => {
    if (!tableSeq) return;
    try {
      const data = await lmsPopApi.getTableFieldList(tableSeq);
      set({ gridData: new CollectionView(data, { trackChanges: true }) });
    } catch (err) {
      console.error(CONSTANTS.MESSAGES.LOAD_ERROR, err);
    }
  },

  fetchTableInfo: async (tableSeq: string) => {
    if (!tableSeq) return;
    try {
      const data = await lmsPopApi.getMainTableInfoData(tableSeq);
      const info = data[0] || { TABLE_NAME: '', TABLE_ID: '', TABLE_SEQ: '' };
      set({
        gridInfo: info,
        initialGridInfo: info,
        flag: !!info.TABLE_ID,
      });
    } catch (err) {
      console.error(CONSTANTS.MESSAGES.LOAD_ERROR, err);
    }
  },

  fetchTableCountInfo: async (tableSeq: string) => {
    if (!tableSeq) return;
    try {
      const resp = await lmsPopApi.getTableCount(tableSeq);
      set({ readOnlyFlag: Boolean(resp.FLAG) });
    } catch (err) {
      console.error(CONSTANTS.MESSAGES.LOAD_ERROR, err);
    }
  },

  // 비즈니스 로직 함수들
  handleAddRow: (tableSeq: string) => {
    if (!tableSeq) return;
    const { gridData, flag } = get();
    if (!gridData) return;

    if (!flag) {
      message.error(CONSTANTS.MESSAGES.TABLE_SAVE_FIRST);
      return;
    }

    const maxSeq = gridData.items
      .map((item) => {
        const colId = item.COL_ID;
        if (!colId) return 0;
        const match = colId.match(/^COL_(\d{3})$/);
        return match ? parseInt(match[1] || '0', 10) : 0;
      })
      .reduce((max, curr) => Math.max(max, curr), 0);

    const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
    const nextColId = `COL_${nextSeq}`;

    const newRow: GridItem = {
      selected: false,
      COL_ID: nextColId,
      COL_NAME: '',
      COL_TYPE: '',
      COL_SIZE: null,
      COL_IDX: false,
      COL_SCH: false,
      TABLE_SEQ: tableSeq,
    };

    const newItem = gridData.addNew();
    Object.assign(newItem, newRow);
    gridData.commitNew();
  },

  saveTableInfo: async (tableSeq: string) => {
    const { gridInfo, gridData, initialGridInfo, flag, fetchTableInfo, fetchFieldList } = get();

    if (!flag) {
      // 첫 저장 (테이블 정보만)
      try {
        await lmsPopApi.saveMainTableInfo([gridInfo]);
        message.success(CONSTANTS.MESSAGES.SAVE_SUCCESS);
        await fetchTableInfo(tableSeq);
        await fetchFieldList(tableSeq);

        if (
          window.opener &&
          typeof (window.opener as Window & { handlePopChange?: () => void }).handlePopChange === 'function'
        ) {
          (window.opener as Window & { handlePopChange: () => void }).handlePopChange();
        }
      } catch (error) {
        console.error('저장 오류:', error);
        message.error(CONSTANTS.MESSAGES.SAVE_ERROR);
      }
    } else {
      // 필드 정보와 함께 저장
      if (!gridData) return;

      const addedItems = (gridData.itemsAdded || []).map((item) => ({
        ...item,
        STATUS: 'INS' as const,
      })) as GridItem[];
      const editedItems = (gridData.itemsEdited || []).map((item) => ({
        ...item,
        STATUS: 'UPD' as const,
      })) as GridItem[];

      const deletedItems = (gridData.itemsRemoved || []).map((item) => ({
        ...item,
        STATUS: 'DEL' as const,
      })) as GridItem[];

      console.log('deletedItems', deletedItems);

      const newItems = [...deletedItems, ...editedItems, ...addedItems];

      if (newItems.length === 0 && initialGridInfo?.TABLE_NAME === gridInfo.TABLE_NAME) {
        message.error(CONSTANTS.MESSAGES.NO_SAVE_CONTENT);
        return;
      }
      console.log('newItems', newItems);
      console.log('gridInfo', gridInfo);
      console.log('gridInfotoptal', { gridInfo, items: newItems });
      if (!validateGridItems(newItems)) return;

      try {
        // 통합 저장 우선 시도, 실패 시 기존 두 단계 저장으로 폴백
        await lmsPopApi.saveTableFieldList({ gridInfo, items: newItems });
        await lmsPopApi.saveMainTableInfo([gridInfo]);
        message.success(CONSTANTS.MESSAGES.SAVE_SUCCESS);
        await fetchTableInfo(tableSeq);
        await fetchFieldList(tableSeq);

        if (
          window.opener &&
          typeof (window.opener as Window & { handlePopChange?: () => void }).handlePopChange === 'function'
        ) {
          (window.opener as Window & { handlePopChange: () => void }).handlePopChange();
        }
      } catch (error) {
        console.error('저장 오류:', error);
        message.error(CONSTANTS.MESSAGES.SAVE_ERROR);
      }
    }
  },

  deleteData: (tableSeq: string) => {
    const { gridData } = get();
    if (!gridData) return;

    const selected = gridData.items.filter((row) => row.selected);

    if (selected.length === 0) {
      message.error(CONSTANTS.MESSAGES.NO_SELECTED_ROWS);
      return;
    }

    selected.forEach((row) => {
      gridData.remove(row);
    });
    gridData.refresh();
    message.success(CONSTANTS.MESSAGES.DELETE_SUCCESS);
    return;
  },

  // 초기화
  reset: () => {
    set({
      flag: false,
      initialGridInfo: null,
      gridData: null,
      commCodes: [],
      gridInfo: { TABLE_NAME: '', TABLE_ID: '', TABLE_SEQ: '' },
      statusMap: new DataMap([], 'COM_CD', 'COM_CD_NM'),
    });
  },
}));
