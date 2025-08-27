import { create } from 'zustand';
import { CollectionView } from '@mescius/wijmo';
import { DataMap } from '@mescius/wijmo.grid';
import { Modal, message } from 'antd';
import lmsHeaderApi from '@api/lmsHeaderApi';
import type { HeaderItem, TableField, SaveHeaderItem } from '@api/lmsHeaderApi';

type TrackableCollectionView<T> = CollectionView<T> & {
  itemsAdded: T[];
  itemsEdited: T[];
  itemsRemoved: T[];
  sourceCollection: T[];
};

interface HeaderTreeItem extends Omit<HeaderItem, 'deps'> {
  children: HeaderTreeItem[];
}

interface LmsHeaderStoreState {
  tableSeq: string | null;
  tableNm: string | null;

  gridData: TrackableCollectionView<HeaderItem> | null;
  treeData: HeaderItem[];
  headerConfig: HeaderItem[];
  tableField: TableField[];
  supiHeaderMap: DataMap | null;
  statusMap: DataMap;
  isCollapsedAll: boolean;
  reviewFlag: boolean;
  showExportButton: boolean;

  setParams: (seq: string | null, name: string | null) => void;

  fetchHeaderList: () => Promise<void>;
  fetchTableFields: () => Promise<void>;

  toggleCollapse: () => void;
  toggleReview: () => void;

  addRow: () => void;
  deleteRows: (selectedItems: HeaderItem[]) => void;
  save: () => void;
  exportFields: () => void;

  buildTree: (flatList: HeaderItem[]) => HeaderItem[];
  buildTreeForPreview: (flatList: HeaderItem[]) => HeaderTreeItem[];
  getNextHeaderId: () => string;
}

export const useLmsHeaderStore = create<LmsHeaderStoreState>((set, get) => ({
  tableSeq: null,
  tableNm: null,

  gridData: null,
  headerConfig: [],
  tableField: [],
  treeData: [],
  supiHeaderMap: null,
  statusMap: new DataMap([], 'COL_ID', 'COL_NAME'),
  isCollapsedAll: false,
  reviewFlag: true,
  showExportButton: false,

  setParams: (seq, name) => set({ tableSeq: seq, tableNm: name }),

  fetchHeaderList: async () => {
    const { tableSeq, buildTree } = get();
    if (!tableSeq) return;
    try {
      const res = await lmsHeaderApi.getHeaderList(tableSeq);
      const treeData = buildTree(res);
      set({
        gridData: new CollectionView<HeaderItem>(treeData, {
          trackChanges: true,
        }) as TrackableCollectionView<HeaderItem>,
        headerConfig: res,
        treeData: treeData,
        supiHeaderMap: new DataMap(
          [{ value: '', name: '\u00A0' }, ...res.map((i) => ({ value: i.HEADER_ID, name: i.HEADER_NAME }))],
          'value',
          'name'
        ),
        showExportButton: !(res && res.length > 0),
      });
    } catch (err) {
      console.error('필드 목록 불러오기 오류:', err);
    }
  },

  fetchTableFields: async () => {
    const { tableSeq } = get();
    if (!tableSeq) return;
    try {
      const res = await lmsHeaderApi.getTableFieldList(tableSeq);
      const withEmptyOption: TableField[] = [{ COL_ID: ' ', COL_NAME: '\u00A0' }, ...res];
      set({ tableField: withEmptyOption, statusMap: new DataMap(withEmptyOption, 'COL_ID', 'COL_NAME') });
    } catch (err) {
      console.error('필드 불러오기 오류:', err);
    }
  },

  toggleCollapse: () => set((state) => ({ isCollapsedAll: !state.isCollapsedAll })),
  toggleReview: () => set((state) => ({ reviewFlag: !state.reviewFlag })),

  addRow: () => {
    const { gridData, tableSeq, getNextHeaderId } = get();
    if (!gridData || !tableSeq) return;
    const newRow: HeaderItem = {
      selected: false,
      HEADER_ID: getNextHeaderId(),
      HEADER_NAME: '',
      SUPI_HEADER: '',
      HEADER_WIDTH: null,
      CONN_FIELD: '',
      SORT_SN: null,
      TABLE_SEQ: tableSeq,
      deps: [],
    };
    const newItem = gridData.addNew();
    Object.assign(newItem, newRow);
    gridData.commitNew();
  },

  deleteRows: (selectedItems: HeaderItem[]) => {
    const { gridData } = get();
    if (!gridData) return;
    Modal.confirm({
      title: '알림',
      content: '삭제 하시겠습니까?',
      onOk: () => {
        const allItems = gridData.items as HeaderItem[];
        const removed: HeaderItem[] = [];

        const findParent = (items: HeaderItem[], target: HeaderItem): HeaderItem | null => {
          for (const it of items) {
            if (it.deps && it.deps.includes(target)) return it;
            if (it.deps && it.deps.length > 0) {
              const parent = findParent(it.deps, target);
              if (parent) return parent;
            }
          }
          return null;
        };

        selectedItems.forEach((item) => {
          const parent = findParent(allItems, item);
          if (parent) {
            const idx = parent.deps.indexOf(item);
            if (idx !== -1) {
              parent.deps.splice(idx, 1);
              removed.push(item);
            }
          } else {
            const idx = allItems.indexOf(item);
            if (idx !== -1) {
              allItems.splice(idx, 1);
              removed.push(item);
            }
          }
        });

        removed.forEach((it) => {
          if (!gridData.itemsRemoved.includes(it)) gridData.itemsRemoved.push(it);
        });

        gridData.refresh();
        message.success('선택한 행들이 삭제되었습니다.');
        if (gridData.sourceCollection.length === 0) {
          set({ showExportButton: true });
        }
      },
    });
  },

  save: () => {
    const { gridData, fetchHeaderList } = get();
    if (!gridData) return;
    const addItems = (gridData.itemsAdded || []).map((item: HeaderItem) => ({ ...item, STATUS: 'ADD' as const }));
    const editItems = (gridData.itemsEdited || []).map((item: HeaderItem) => ({ ...item, STATUS: 'UPD' as const }));
    const removeItems = (gridData.itemsRemoved || []).map((item: HeaderItem) => ({ ...item, STATUS: 'DEL' as const }));

    const sendItems = [...addItems, ...editItems, ...removeItems] as SaveHeaderItem[];

    if (sendItems.length === 0) {
      message.error('수정된 행이 없습니다.');
      return;
    }

    for (const item of sendItems) {
      if (!item.HEADER_NAME) {
        message.error('헤더명은 필수 입력 항목입니다.');
        return;
      }
      if (!item.SORT_SN) {
        message.error('정렬순서는 필수 입력 항목입니다.');
        return;
      }
    }

    Modal.confirm({
      title: '알림',
      content: '저장하시겠습니까?',
      style: { top: 200 },
      async onOk() {
        try {
          await lmsHeaderApi.saveHeaderList(sendItems);
          message.success('저장되었습니다.');
          await get().fetchHeaderList();
        } catch (error) {
          console.error('저장 오류:', error);
          message.error('저장 중 오류가 발생했습니다.');
        }
      },
    });
  },

  exportFields: () => {
    const { gridData, tableSeq, tableField, getNextHeaderId } = get();
    if (!gridData || !tableSeq) return;
    if (gridData.sourceCollection.length > 0) {
      message.warning('이미 헤더 목록이 존재하여 필드를 가져올 수 없습니다.');
      return;
    }
    tableField.forEach((item) => {
      if (item.COL_ID && item.COL_ID.trim() !== '') {
        const newRow: HeaderItem = {
          selected: false,
          HEADER_ID: getNextHeaderId(),
          HEADER_NAME: item.COL_NAME || '',
          SUPI_HEADER: '',
          HEADER_WIDTH: 100,
          CONN_FIELD: item.COL_ID,
          SORT_SN: 1,
          TABLE_SEQ: tableSeq,
          deps: [],
        };
        const newItem = gridData.addNew();
        Object.assign(newItem, newRow);
        gridData.commitNew();
      }
    });
    set({ showExportButton: false });
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

  buildTreeForPreview: (flatList: HeaderItem[]): HeaderTreeItem[] => {
    const map: { [key: string]: HeaderTreeItem } = {};
    const roots: HeaderTreeItem[] = [];
    flatList.forEach((item) => {
      item.selected = Boolean(item.selected);
      map[item.HEADER_ID] = { ...item, children: [] };
    });
    flatList.forEach((item) => {
      const currentItem = map[item.HEADER_ID];
      if (!currentItem) return;
      const parent = item.SUPI_HEADER ? map[item.SUPI_HEADER] : undefined;
      if (parent) parent.children.push(currentItem);
      else roots.push(currentItem);
    });
    return roots;
  },

  getNextHeaderId: () => {
    const { gridData } = get();
    if (!gridData || !gridData.items) return 'HEAD_001';
    let max = 0;
    const walk = (items: HeaderItem[]): void => {
      items.forEach((item: HeaderItem) => {
        const match = /^HEAD_(\d+)$/.exec(item.HEADER_ID);
        if (match) {
          const num = parseInt(match[1] as string, 10);
          if (num > max) max = num;
        }
        if (Array.isArray(item.deps)) walk(item.deps);
      });
    };
    const itemsForWalk = gridData.items.filter(
      (it): it is HeaderItem => typeof (it as HeaderItem).HEADER_ID === 'string'
    );
    walk(itemsForWalk);
    const nextNum = max + 1;
    return `HEAD_${String(nextNum).padStart(3, '0')}`;
  },
}));

export default useLmsHeaderStore;
