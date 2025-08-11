import { create } from 'zustand';
import api from "@api/api.js";

import {CollectionView} from "@mescius/wijmo";
import {FlexGrid as FlexGridType} from '@mescius/wijmo.grid';
import * as wjcGridXlsx from '@mescius/wijmo.grid.xlsx';
import type { RefObject } from 'react';
import openPop from "@utils/openPop";

interface UdaGridList {
    tableSeq: number | null;
    tableId: string;
    tableName: string;
    vbgCreUser: string;
    vbgCreDtm: string;
    dataCount: number;
    selected: boolean;
}

interface UdaGridData {
    gridRef: RefObject<{control: FlexGridType}> | null;
    setGridRef: (ref: RefObject<{control: FlexGridType}>) => void;
    exportExcel: () => void;
    gridData: CollectionView<UdaGridList> | null;
    setGridData: (data: CollectionView<UdaGridList>) => void;
    fetchGridData: () => void;
    addGridData: () => void;
    saveGridData: () => Promise<void>;
    deleteGridData: () => Promise<void>;
    openPopup: (seq: string | null) => void;
}

const useGridData = create<UdaGridData>((set) => ({
    gridRef: null,
    setGridRef: (ref) => set({ gridRef: ref }),
    exportExcel: () => {
        const gridRef = useGridData.getState().gridRef;
        const grid =  gridRef?.current;

        if(!grid) return;

        wjcGridXlsx.FlexGridXlsxConverter.saveAsync(grid.control, {
            includeColumnHeaders: true,
            includeStyles: false,
            //formatItem: formatItem
        }, 'FlexGrid.xlsx');
    },
    gridData: null,
    setGridData: (data) => {
        set({gridData: data});
    },
    fetchGridData: () => {
        const search = (document.getElementById('search') as HTMLInputElement | null)?.value || '';
        const start = (document.getElementById('start') as HTMLInputElement | null) ?.value || '';
        const end = (document.getElementById('end') as HTMLInputElement | null)?.value || '';

        const cond = {
            search,
            start,
            end
        };

        api.get<UdaGridList[]>('/kjoApi/mainTable', {params: cond})
            .then((res) => {
                set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
            }).catch((err) => {
            console.error(err);
        });
    },
    addGridData: () => {
        const view = useGridData.getState().gridData;

        if(!view) return;

        let maxTableId: string = '';
        const items = view.items;

        if(items.length === 0) {
            maxTableId = "uda_db_001";
        } else {
            const tableIds: number[] = view.items.map(d => Number(d.tableId?.split("_")[2]));

            let max = 0;
            tableIds.forEach(n => {
                max = Math.max(max, n+1);
            });

            maxTableId = "uda_db_" + String(max).padStart(3, '0');
        }

        const newItem = view.addNew();

        newItem.tableSeq = null;
        newItem.selected = false;
        newItem.tableId = maxTableId;

        view.commitNew();
    },
    saveGridData: async () => {
        const view = useGridData.getState().gridData;

        if(!view) return;

        const added = view.itemsAdded || [];

        if(added.length === 0) {
            alert("추가된 행이 없습니다.");
            return;
        }

        for(const data of added){
            if(data.tableName == null || data.tableName === '') {
                alert("논리 테이블명은 필수 값 입니다.");
                return;
            }
        }
        const cond = Array.from(added).map(row => ({ ...row }));

        if(confirm("저장하시겠습니까?")) {
            await api.post(`/kjoApi/mainTable`, cond);
            useGridData.getState().fetchGridData();
        }
    },
    deleteGridData: async () => {
        const view = useGridData.getState().gridData;

        if(!view) return;

        const data = view.items;
        const selectedRows = data.filter((data) => { return data.selected});

        if(selectedRows.length === 0){
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        const deleteData = selectedRows.filter((data) => {return data.tableSeq != null});

        if(deleteData.length !== 0){
            if(confirm("삭제하시겠습니까?")) {
                await api.post('/kjoApi/deleteMainTable', deleteData);
                useGridData.getState().fetchGridData();
            }
        } else {
            const unSelectedRows = data.filter((data) => {return !data.selected});
            set({ gridData: new CollectionView(unSelectedRows, {trackChanges: true }) });
        }
    },
    openPopup: (seq) => {
        const view = useGridData.getState().gridData;

        if(!view) return;

        const selectedRows = view.items.filter((data) => data.selected);
        let tableSeq = seq;

        if(selectedRows.length !== 0){
            tableSeq = selectedRows[0]?.tableSeq?.toString() ?? null;
        }

        if(!tableSeq) {
            if(selectedRows.length === 0){
                alert("수정할 행을 선택해주세요.");
            } else if(selectedRows.length > 1){
                alert("1개의 행을 선택해주세요.");
            } else {
                alert("신규 추가된 행 입니다. 저장 후 수정해주세요");
            }

            return;
        }


        const url = `/popup/kjo_pop?tableSeq=${encodeURIComponent(tableSeq)}`;
        openPop(url, ()=> {});

        // const popupWidth = 1000;
        // const popupHeight = 600;
        //
        // const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        // const top = window.screenY + (window.outerHeight - popupHeight) / 2;
        //
        // window.open(
        //     `/popup/kjo_pop?tableSeq=${encodeURIComponent(tableSeq)}`,
        //     '_blank',
        //     `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        // );
    }
}));

export default useGridData;

