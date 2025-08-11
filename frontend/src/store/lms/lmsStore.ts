import { create } from 'zustand';
import { CollectionView } from '@mescius/wijmo';
import { message } from 'antd';
import lmsApi from '@api/lmsApi';
import { getNextTableId } from '@utils/tableUtils';

// 상수 정의
const CONSTANTS = {
  TABLE_NAME_MAX_LENGTH: 100,
  TABLE_ID_MAX_LENGTH: 10,
  MESSAGES: {
    TABLE_NAME_REQUIRED: '논리 테이블명은 필수 입력 항목입니다.',
    TABLE_ID_INVALID: '물리 테이블명은 영문, 숫자, 언더스코어(_)만 허용하며 10자 이내로 입력이 가능합니다.',
    TABLE_NAME_TOO_LONG: '논리 테이블명은 100자 이내로 입력해주세요.',
    NO_SELECTED_ROWS: '선택된 행이 없습니다.',
    SAVE_SUCCESS: '저장되었습니다.',
    DELETE_SUCCESS: '삭제되었습니다.',
    SAVE_ERROR: '저장 중 오류가 발생했습니다.',
    DELETE_ERROR: '삭제 중 오류 발생',
    LOAD_ERROR: '데이터 불러오기 오류:',
  },
};

interface TableRow {
  TABLE_SEQ: string;
  TABLE_NAME: string;
  TABLE_ID: string;
  field_count: string;
  VBG_CRE_USER: string;
  VBG_CRE_DTM: string;
  selected: boolean;
  REQ?: boolean; // 삭제 조건 체크용
}

interface LmsStoreState {
  data: TableRow[];
  cv: CollectionView<TableRow> | null;

  setData: (data: TableRow[]) => void;
  setCv: (cv: CollectionView<TableRow>) => void;
  fetchGridData: (startDate: Date, endDate: Date) => Promise<void>;
  handleAddRow: () => void;
  saveTable: (startDate: Date, endDate: Date) => Promise<void>;
  deleteData: (startDate: Date, endDate: Date) => Promise<void>;
  reset: () => void;
}

// 날짜 포맷팅 함수
const formatDate = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

// 테이블명 유효성 검사
const isValidTableName = (name: string): boolean => {
  if (name === '') return true;
  const regex = /^[A-Za-z0-9_]{1,10}$/;
  return regex.test(name);
};

// 데이터 검증
const validateData = (items: TableRow[]) => {
  for (const item of items) {
    if (!item.TABLE_NAME) {
      message.error(CONSTANTS.MESSAGES.TABLE_NAME_REQUIRED);
      return false;
    }

    if (!isValidTableName(item.TABLE_ID)) {
      message.error(CONSTANTS.MESSAGES.TABLE_ID_INVALID);
      return false;
    }

    if (item.TABLE_NAME.length > CONSTANTS.TABLE_NAME_MAX_LENGTH) {
      message.error(CONSTANTS.MESSAGES.TABLE_NAME_TOO_LONG);
      return false;
    }
  }
  return true;
};

export const useLmsStore = create<LmsStoreState>((set, get) => ({
  // 상태
  data: [],
  cv: null,

  // 액션
  setData: (data) => set({ data }),
  setCv: (cv) => set({ cv }),

  fetchGridData: async (startDate, endDate) => {
    try {
      const condition = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      };

      const responseData = (await lmsApi.getMainTableInfo(condition)) as TableRow[];
      set({
        data: responseData,
        cv: new CollectionView(responseData, { trackChanges: true }),
      });
    } catch (err) {
      console.error(CONSTANTS.MESSAGES.LOAD_ERROR, err);
    }
  },

  // 행 추가
  handleAddRow: () => {
    const { cv } = get();
    if (!cv) return;

    const nextTableId = getNextTableId(cv.items);

    const newRow = {
      TABLE_SEQ: '',
      TABLE_NAME: '',
      TABLE_ID: nextTableId,
      field_count: 0,
      VBG_CRE_USER: '',
      VBG_CRE_DTM: new Date().toISOString().split('T')[0],
      selected: false,
    };

    const newItem = cv.addNew();
    Object.assign(newItem, newRow);
    cv.commitNew();
  },

  // 저장
  saveTable: async (startDate, endDate) => {
    const { cv, fetchGridData } = get();
    if (!cv) return;

    const addedItems = (cv.itemsAdded as TableRow[]) || [];
    const editedItems = (cv.itemsEdited as TableRow[]) || [];
    const newItems = [...addedItems, ...editedItems];

    if (newItems.length === 0) {
      message.error('저장할 내용이 없습니다.');
      return;
    }

    if (!validateData(newItems)) return;

    try {
      await lmsApi.saveMainTableInfo(newItems);
      message.success(CONSTANTS.MESSAGES.SAVE_SUCCESS);
      await fetchGridData(startDate, endDate);
    } catch (error) {
      console.error('저장 오류:', error);
      message.error(CONSTANTS.MESSAGES.SAVE_ERROR);
    }
  },

  // 삭제
  deleteData: async (startDate, endDate) => {
    const { cv, fetchGridData } = get();
    if (!cv) return;

    const selected = cv.items.filter((row) => row.selected);
    const seqList: string[] = selected
      .map((row) => row.TABLE_SEQ)
      .filter((seq): seq is string => typeof seq === 'string' && seq.length > 0);

    if (selected.length === 0) {
      message.error(CONSTANTS.MESSAGES.NO_SELECTED_ROWS);
      return;
    }

    if (seqList.length === 0) {
      const filtered = cv.items.filter((row) => !row.selected || row.REQ);
      set({ cv: new CollectionView(filtered, { trackChanges: true }) });
      return;
    }

    try {
      await lmsApi.deleteMainTableInfo(seqList);
      message.success(CONSTANTS.MESSAGES.DELETE_SUCCESS);
      await fetchGridData(startDate, endDate);
    } catch (err) {
      console.error('삭제 오류:', err);
      message.error(CONSTANTS.MESSAGES.DELETE_ERROR);
    }
  },

  // 상태 초기화
  reset: () => {
    set({ data: [], cv: null });
  },
}));
