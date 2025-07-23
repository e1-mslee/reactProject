import { create } from 'zustand';
import api from "../api/api.js";
import { CollectionView } from "@mescius/wijmo";

const useColData = create((set) => ({
    gridRef: null,
    setGridRef: (ref) => set({ gridRef: ref }),
    initData: null,
    fetchInitData: (seq) => {
        let cond = {
            tableSeq: seq
        };

        api.get('/kjoApi/tableName', {params: cond})
            .then((res) => {
                set({ initData: res.data });
            }).catch((err) => {
            console.error(err);
        });
    },
    gridData: null,
    fetchGridData: (seq) => {
        let cond = {
            tableSeq: seq
        };

        api.get('/kjoApi/fieldTable', {params: cond})
            .then((res) => {
                set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
            }).catch((err) => {
            console.error(err);
        });
    },
    addGridData: (seq) => {
        let gridRef = useColData.getState().gridRef.current.control;
        let initData = useColData.getState().initData;
        let view = useColData.getState().gridData;
        let data = view.items;

        let tableNm = document.getElementById("tableNm").value;
        let tableId = document.getElementById("tableId").value;

        if(initData == null || initData[0].tableId == null || initData[0].tableId === "") {
            alert("테이블을 먼저 생성해주세요.");
            return;
        }

        if(tableNm == null || tableNm === "") {
            alert("논리 테이블 명을 입력해주세요.");
            return;
        }

        if(tableId == null || tableId === "") {
            alert("물리 테이블 명을 입력해주세요.");
            return;
        }

        let newItem = view.addNew();
        let row = gridRef.rows.length-2;

        if(row === -1) {
            newItem.colId = "COL_001";
        } else {
            console.log(data[row]);
            let num = data[row].colId.split("_")[1];
            let n = Number(num)+1;

            newItem.colId = "COL_" + String(n).padStart(3,"0");
        }

        newItem.tableSeq = seq;
        newItem.selected = false;
        newItem.colIdx = false;
        newItem.colSch = false;

        view.commitNew();
    },
    saveColData: (seq) => {
        let initData = useColData.getState().initData;
        let view = useColData.getState().gridData;

        let tableNm = document.getElementById("tableNm").value;
        let tableId = document.getElementById("tableId").value;

        if(!confirm("저장하시겠습니까?")) return;

        if(tableNm == null || tableNm === "") {
            alert("논리 테이블 명을 입력해주세요.");
            return;
        }

        if(tableId == null || tableId === "") {
            alert("물리 테이블 명을 입력해주세요.");
            return;
        }

        if(initData == null || initData[0].tableId == null || initData[0].tableId === "") {
            let cond = {
                tableSeq: seq,
                tableNm: tableNm,
                tableId: tableId
            }
            api.put('/kjoApi/mainTable', cond).then(() => {
                alert("저장되었습니다.");
            });
        } else {
            let added = view.itemsAdded || [];
            let edited = view.itemsEdited || [];
            let removed = view.itemsRemoved || [];

            let cond = {
                added: Array.from(added).map(row => ({ ...row })),
                edited: Array.from(edited).map(row => ({ ...row })),
                removed: Array.from(removed).map(row => ({ ...row }))
            }

            api.post('/kjoApi/fieldTable', cond).then(() => {
                alert("저장되었습니다.");
                useColData.getState().fetchGridData(seq);
            });
        }
    },
    deleteGridData: () => {
        let gridRef = useColData.getState().gridRef.current.control;
        let data = useColData.getState().gridData.items;
        let selectedRows = data.filter((d) => { return d.selected });

        if(selectedRows.length === 0) {
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        for(let selectedRow of selectedRows) {
            gridRef.collectionView.remove(selectedRow);
        }
    }
}));

export default useColData;

