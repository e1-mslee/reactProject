import { create } from 'zustand';
import api from "@api/api.js";

import {CollectionView} from "@mescius/wijmo";
import {FlexGrid as FlexGridType} from '@mescius/wijmo.grid';
import * as wjcGridXlsx from '@mescius/wijmo.grid.xlsx';
import type { RefObject } from 'react';
import openPop from "@utils/openPop";

interface GridHeaderData {
    tableSeq: number;
    headerId: string;
    headerName: string;
    supiHeader: string;
    headerWidth: number;
    connField: string;
    sortSn: string;
    dept: number;
    cellSize: number;
    child: number;
}

interface GridFieldData {
    selected: boolean;
    tableSeq: number;
    colId: string;
    colName: string;
    colType: number;
    colSize: number | null;
    colIdx: boolean;
    colSch: boolean;
}

interface UdaTableData {
    gridRef: RefObject<{control: FlexGridType}> | null;
    setGridRef: (ref: RefObject<{control: FlexGridType}>) => void;
    gridHeaderData: GridHeaderData[] | null;
    fetchGridHeaderData: (seq: string) => void;
    gridFieldData:GridFieldData[] | null;
    fetchGridFieldData: (seq: string) => void;
    gridData: CollectionView<string> | null;
    fetchGridData: (tableSeq: string, tableId: string) => void;
    excelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    searchRow: (tableSeq: string, tableId: string) => void;
    addRow: () => void;
    deleteRow: () => void;
    saveRow: (tableSeq: string, tableId: string) => void;
    excelDown: (tableSeq: string, tableId: string) => void;
}

const useTableData = create<UdaTableData>((set) => ({
    gridRef: null,
    setGridRef: (ref) => set({ gridRef: ref }),
    gridHeaderData: null,
    fetchGridHeaderData: (seq) => {
        const cond = {
            tableSeq: seq
        }

        api.get<GridHeaderData[]>('/kjoApi/gridHeaderTable', {params: cond}).then((res) => {
            set({ gridHeaderData: res.data });
        }).catch((err) => {
            console.error(err);
        });
    },
    gridFieldData: null,
    fetchGridFieldData: (seq) => {
        const cond = {
            tableSeq: seq,
        };

        api.get<GridFieldData[]>("/kjoApi/fieldTable", {params: cond})
        .then((res) => {
            set({ gridFieldData: res.data });
        }).catch((err) => {
            console.log(err);
        });
    },
    gridData: null,
    fetchGridData: (tableSeq, tableId) => {
        const cond = {
            tableSeq: tableSeq,
            tableId: tableId
        };

        api.get("/kjoApi/getDynamicTable", {params: cond})
        .then((res) => {
            set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
        }).catch((err) => {
            console.log(err);
        });
    },
    excelUpload: (e, tableId, tableSeq) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();

        formData.append("file", file);
        formData.append("tableId", tableId);
        formData.append("tableSeq", tableSeq);

        api.post("/kjoApi/excelUpload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
         }).then(async (res) => {
             console.log(res);
            if (res.status != 200) {
                throw new Error("업로드 실패");
            }
            if(res.data == "001") {
                alert("엑셀 업로드 실패");
            }

            useTableData.getState().fetchGridData(tableSeq, tableId);
        }).catch((err) => {
            console.error("업로드 에러:", err);
        });
    },
    searchRow: (tableSeq, tableId) => {
        useTableData.getState().fetchGridData(tableSeq, tableId);
    },
    addRow: () => {
        const view = useTableData.getState().gridData;
        const field = useTableData.getState().gridFieldData;

        if(!view) return;

        const checkBox = field.filter(d => d.colType == "6");

        const newItem = view.addNew();

        newItem.selected = false;

        for(let c of checkBox) {
            newItem[c.colId] = false;
        }

        view.commitNew();
    },
    deleteRow: () => {
        const view = useTableData.getState().gridData;

        if(!view) return;

        const data = view.items;
        const selectedRows = data.filter((d) => { return d.selected});
        const unSelectedRows = data.filter((d) => { return !d.selected});

        if(selectedRows.length === 0){
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        for(const sel of selectedRows) {
            view.remove(sel);
        }
    },
    saveRow: (tableSeq, tableId) => {
        const view = useTableData.getState().gridData;

        if(!view) return;

        if(!confirm("저장하시겠습니다까?")) return;

        const added = view.itemsAdded;
        const removed = view.itemsRemoved;
        const edited = view.itemsEdited;

        const cond = {
            tableSeq: tableSeq,
            tableId: tableId,
            added: Array.from(added).map(row => ({...row})),
            removed: Array.from(removed).map(row => ({...row})),
            edited: Array.from(edited).map(row => ({...row}))
        }

        api.post("/kjoApi/setDynamicTable", cond)
        .then((res) => {
            alert("저장되었습니다.");
            useTableData.getState().fetchGridData(tableSeq, tableId);
        }).catch((err) => {
            console.log(err);
        });
    },
    excelDown: async (tableSeq, tableId) => {
        const cond = {
            tableSeq: tableSeq,
            tableId: tableId
        }

        try {
            const response = await api.get('/kjoApi/excelDown', {
                params: cond,
                responseType: "blob", // 바이너리 데이터 응답

            });

            // Blob 객체 생성
            // Blob으로 변환
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // 다운로드 링크 생성
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", tableId + "_data.xlsx"); // 저장될 파일명
            document.body.appendChild(link);
            link.click();

            // 정리
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("엑셀 다운로드 실패:", error);
        }
    }
}));

export default useTableData;