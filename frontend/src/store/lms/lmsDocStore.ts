import { create } from 'zustand';
import lmsHeaderApi from '@api/lmsHeaderApi';
import type { HeaderItem, TableField } from '@api/lmsHeaderApi';
import lmsDocApi from '@/api/lmsDocApi';

interface LmsHeaderStoreState {
  tableSeq: string | null;

  gridData: HeaderItem[] | null;
  treeData: HeaderItem[] | null;
  tableField: TableField[];
  tableData: [];

  setParams: (seq: string | null) => void;
  fetchHeaderList: () => Promise<void>;
  fetchTableDataList: () => Promise<void>;
  buildTree: (flatList: HeaderItem[]) => HeaderItem[];
}

export const useLmsDocStore = create<LmsHeaderStoreState>((set, get) => ({
  tableSeq: null,
  gridData: [],
  tableField: [],
  tableData: [],
  treeData: [],

  setParams: (seq) => set({ tableSeq: seq }),

  fetchHeaderList: async () => {
    const { tableSeq, buildTree } = get();
    if (!tableSeq) return;
    try {
      const res = await lmsHeaderApi.getHeaderList(tableSeq);
      const treeData = buildTree(res);
      set({
        gridData: res,
        treeData: treeData,
      });
    } catch (err) {
      console.error('필드 목록 불러오기 오류:', err);
    }
  },
  fetchTableDataList: async () => {
    const { tableSeq } = get();
    if (!tableSeq) return;
    const res = await lmsDocApi.getDataList(tableSeq);
    set({
      tableData: res,
    });
    try {
    } catch (err) {
      console.error('데이터 가져오기 에러', err);
    }
  },

  buildTree: (flatList: HeaderItem[]): HeaderItem[] => {
    const map: { [key: string]: HeaderItem } = {};
    const roots: HeaderItem[] = [];
    flatList.forEach((item) => {
      item.selected = Boolean(item.selected);
      map[item.HEADER_ID] = item;
      item.deps = [];
    });
    flatList.forEach((item) => {
      if (item.SUPI_HEADER) {
        const parent = map[item.SUPI_HEADER];
        if (parent) parent.deps.push(item);
        else roots.push(item);
      } else {
        roots.push(item);
      }
    });
    return roots;
  },
}));

export default useLmsDocStore;
