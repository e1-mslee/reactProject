import { create } from 'zustand';
import api from "@api/api.js";
import { CollectionView } from "@mescius/wijmo";
import type { RefObject } from 'react';
import {FlexGrid as FlexGridType} from '@mescius/wijmo.grid';
import openPop from "@utils/openPop";

interface InitData {
    tableName: string
    tableId: string
}

interface GridData {
    tableSeq: number;
    colId: string;
    colName: string;
    colType: number;
    colSize: number | null;
    colIdx: boolean;
    colSch: boolean;
    selected: boolean;
}

interface UseColData {
    gridRef: RefObject<{control: FlexGridType}> | null
    setGridRef: (ref: RefObject<{control: FlexGridType}>) => void
    initData: InitData[] | null
    fetchInitData: (seq: string) => void
    gridData: CollectionView<GridData> | null
    fetchGridData: (seq: string) => void
    addGridData: (seq: string) => void
    deleteGridData: () => void
    saveColData: (seq: string) => void
    headerPopup: (seq: string) => void
}

const useColData = create<UseColData>((set) => ({
    gridRef: null,
    setGridRef: (ref) => set({ gridRef: ref }),
    initData: null,
    fetchInitData: (seq) => {
        const cond = {
            tableSeq: seq
        };

        api.get<InitData[]>('/kjoApi/tableName', {params: cond})
            .then((res) => {
                set({ initData: res.data });
            }).catch((err) => {
            console.error(err);
        });
    },
    gridData: null,
    fetchGridData: (seq) => {
        const cond = {
            tableSeq: seq
        };

        api.get<GridData[]>('/kjoApi/fieldTable', {params: cond})
            .then((res) => {
                set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
            }).catch((err) => {
            console.error(err);
        });
    },
    addGridData: (seq) => {
        const gridRef = useColData.getState().gridRef?.current?.control;
        const initData = useColData.getState().initData;
        const view = useColData.getState().gridData;

        if(!view) return;

        const data = view.items;

        const tableNm = (document.getElementById("tableNm") as HTMLInputElement | null)?.value || '';
        const tableId = (document.getElementById("tableId") as HTMLInputElement | null)?.value || '';

        if(initData == null || initData?.[0]?.tableId == null) {
            alert("테이블을 먼저 생성해주세요.");
            return;
        }

        if(!tableNm) {
            alert("논리 테이블 명을 입력해주세요.");
            return;
        }

        if(!tableId) {
            alert("물리 테이블 명을 입력해주세요.");
            return;
        }

        const newItem = view.addNew() as GridData;
        const length = gridRef?.rows?.length ?? 0;
        const row = length > 0? length - 2 : -1;

        if(row === -1) {
            newItem.colId = "COL_001";
        } else {
            const lastColId = data[row]?.colId ?? "COL_000";
            const num = lastColId.split("_")[1];
            const n = Number(num) + 1;

            newItem.colId = "COL_" + String(n).padStart(3,"0");
        }

        newItem.tableSeq = Number(seq);
        newItem.selected = false;
        newItem.colIdx = false;
        newItem.colSch = false;

        view.commitNew();
    },
    deleteGridData: () => {
        const gridRef = useColData.getState().gridRef?.current?.control;

        const data = useColData.getState().gridData?.items;
        const selectedRows = data?.filter((d) => { return d.selected }) ?? [];

        if(selectedRows?.length === 0) {
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        for(const selectedRow of selectedRows) {
            const collectionView = gridRef?.collectionView as CollectionView;
            collectionView.remove(selectedRow);
        }
    },
    saveColData: (seq) => {
        const initData = useColData.getState().initData;
        const view = useColData.getState().gridData;

        const tableNm = (document.getElementById("tableNm") as HTMLInputElement || null)?.value || '';
        const tableId = (document.getElementById("tableId") as HTMLInputElement || null)?.value || '';

        const items = view?.items || [];

        const added = view?.itemsAdded || [];
        const edited = view?.itemsEdited || [];
        const removed = view?.itemsRemoved || [];

        if(!confirm("저장하시겠습니까?")) return;

        if(tableNm == null || tableNm === "") {
            alert("논리 테이블 명을 입력해주세요.");
            return;
        }

        if(tableId == null || tableId === "") {
            alert("물리 테이블 명을 입력해주세요.");
            return;
        }

        if(added.length === 0 && edited.length === 0 && removed.length === 0 && initData?.[0]?.tableName !== tableNm) {
            alert("변경사항이 없습니다.");
            return;
        }

        const addedName = added.filter(d => !d.colName);
        const editedName = edited.filter(d => !d.colName);

        if(addedName.length > 0 || editedName.length > 0) {
            alert("컬럼명은 필수 값입니다.");
            return;
        }

        const addedSize = added.filter(d => !d.colSize);
        const editedSize = edited.filter(d => !d.colSize);

        if(addedSize.length > 0 || editedSize.length > 0) {
            alert("길이는 필수 값입니다.");
            return;
        }

        if(initData?.[0]?.tableName !== tableNm || !initData?.[0]?.tableId) {
            const cond = {
                tableSeq: seq,
                tableNm: tableNm,
                tableId: tableId
            }

            api.put('/kjoApi/mainTable', cond)
                .then(() => {
                    alert("저장되었습니다.");
                    useColData.getState().fetchInitData(seq);
                }).catch((err) => {
                console.error(err);
            });
        }

        if(initData != null && initData?.[0]?.tableId) {
            if(added.length === 0 && edited.length === 0 && removed.length === 0) return;

            const cond = {
                tableId: tableId,
                items: Array.from(items).map(row => ({ ...row })),
                added: Array.from(added).map(row => ({ ...row })),
                edited: Array.from(edited).map(row => ({ ...row })),
                removed: Array.from(removed).map(row => ({ ...row }))
            }

            api.post('/kjoApi/fieldTable', cond)
                .then(() => {
                useColData.getState().fetchGridData(seq);
            }).catch((err) => {
                console.error(err);
            });
        }


    },
    headerPopup : (seq) => {
        const url = `/popup/kjo_header_pop?tableSeq=${encodeURIComponent(seq)}`;

        openPop(url, () => {});
    }
}));

export default useColData;

