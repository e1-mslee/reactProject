import { create } from 'zustand';
import api from "../api/api.js";
import moment from 'moment';

import {CollectionView} from "@mescius/wijmo";
import * as wjGrid from '@mescius/wijmo.grid';
import * as wjcGridXlsx from '@mescius/wijmo.grid.xlsx';

const useGridData = create((set) => ({
    gridRef: null,
    setGridRef: (ref) => set({ gridRef: ref }),
    exportExcel: () => {
        let gridRef = useGridData.getState().gridRef.current.control;

        wjcGridXlsx.FlexGridXlsxConverter.saveAsync(gridRef, {
            includeColumnHeaders: true,
            includeStyles: false,
            //formatItem: formatItem
        }, 'FlexGrid.xlsx');
    },
    gridData: null,
    setGridData: (data) => {
        set({gridData: [...data]});
    },
    fetchGridData: () => {
        let search = document.getElementById('search')?.value;
        let start = document.getElementById('start')?.value;
        let end = document.getElementById('end')?.value;

        let cond = {
            search: search,
            start: start,
            end: end
        };

        api.get('/kjoApi/mainTable', {params: cond})
            .then((res) => {
                set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
            }).catch((err) => {
            console.error(err);
        });
    },
    addGridData: () => {
        let view = useGridData.getState().gridData;

        let newItem = view.addNew();
        newItem.tableSeq = null;
        newItem.selected = false;

        view.commitNew();
        //set({ gridData: new CollectionView([...data, newData], { trackChanges: true }) });
    },
    saveGridData: async () => {
        let view = useGridData.getState().gridData;

        let added = view.itemsAdded || [];
        let edited = view.itemsEdited || [];

        let updatedData = [ ...added, ...edited];

        if(updatedData.length === 0) {
            alert("추가된 행이 없습니다.");
            return;
        }

        for(let data of updatedData){
            if(data.tableName == null || data.tableName === '') {
                alert("논리 테이블명은 필수 값 입니다.");
                return;
            }

            /*if(data.tableId == null || data.tableId === '') {
                alert("물리 테이블명은 필수 값 입니다.");
                return;
            }*/

            /*if(data.tableId.length > 10) {
                alert("물리 테이블은 최대 10자리 입니다.");
                return;
            }*/
        }

        if(confirm("저장하시겠습니까?")) {
            await api.post(`/kjoApi/mainTable`, updatedData);
            useGridData.getState().fetchGridData();
        }
    },
    deleteGridData: async () => {
        let data = useGridData.getState().gridData.items;
        let selectedRows = data.filter((data) => { return data.selected});

        if(selectedRows.length === 0){
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        let deleteData = selectedRows.filter((data) => {return data.tableSeq != null}).map(m => m.tableSeq);

        if(deleteData.length !== 0){
            if(confirm("삭제하시겠습니까?")) {
                await api.post('/kjoApi/deleteMainTable', deleteData);
                useGridData.getState().fetchGridData();
            }
        } else {
            let unSelectedRows = data.filter((data) => {return !data.selected});
            set({ gridData: unSelectedRows });
        }
    },
    openPopup: (seq) => {
        let data = useGridData.getState().gridData.items;
        let selectedRows = data.filter((data) => { return data.selected});
        let tableSeq = seq;

        if(selectedRows.length !== 0){
            tableSeq = selectedRows[0].tableSeq;
        }

        if(tableSeq == null || tableSeq === '' || tableSeq === undefined) {
            alert("신규 추가된 행 입니다. 저장 후 수정해주세요");
            return;
        }

        if(seq == null && selectedRows.length === 0){
            alert("수정할 행을 선택해주세요.");
            return;
        }
        if(seq == null && selectedRows.length > 1){
            alert("1개의 행을 선택해주세요.");
            return;
        }

        const popupWidth = 1000;
        const popupHeight = 600;

        const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        const top = window.screenY + (window.outerHeight - popupHeight) / 2;
        window.open(
            `/popup/kjo_pop?tableSeq=${encodeURIComponent(tableSeq)}`,
            '_blank',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }
}));

export default useGridData;

