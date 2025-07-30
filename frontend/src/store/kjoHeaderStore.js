import {create} from 'zustand';
import api from "../api/api.js";
import {CollectionView} from "@mescius/wijmo";

const useHeaderData = create((set) => ({
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

        api.get('/kjoApi/headerTable', {params: cond})
            .then((res) => {
                if(res.data.length === 0)
                    document.getElementById("fieldMatching").style.display = "block";
                else
                    document.getElementById("fieldMatching").style.display = "none";

                set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
            }).catch((err) => {
            console.error(err);
        });
    },
    addRow: (seq) => {
        let headerData = useHeaderData.getState().headerData;
        let view = useHeaderData.getState().gridData;

        let newItem = view.addNew();
        let row = headerData.length-1;

        if(row === -1) {
            newItem.headerId = "HEAD_001";
            newItem.sortSn = 1;
        } else {
            let num = headerData[row].headerId.split("_")[1];
            let n = Number(num)+1;

            newItem.headerId = "HEAD_" + String(n).padStart(3,"0");
            newItem.sortSn = n;
        }

        newItem.selected = false;
        newItem.tableSeq = seq;

        view.commitNew();

        headerData.push(newItem);

        set({ headerData: [...headerData] });
    },
    deleteRow: () => {
        let headerData = useHeaderData.getState().headerData;
        let gridRef = useHeaderData.getState().gridRef.current.control;
        let view = useHeaderData.getState().gridData;
        let data = view.items;
        let selectedRows = [];

        function findSelectedRow(data) {
            return data
                .map(node => {
                    const filteredChildren = findSelectedRow(node.children || []);

                    if (!node.selected) {
                        return {
                            ...node,
                            children: filteredChildren,
                        };
                    } else {
                        headerData = headerData.filter(item => {return item.headerId !== node.headerId});
                        selectedRows.push(node);
                    }
                    return null; // 선택된 항목 제거
                })
                .filter(Boolean); // null 제거
        }

        let newGridData = findSelectedRow(data);

        if(selectedRows.length === 0) {
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        let source= view.sourceCollection;
        source.splice(0, source.length, ...newGridData);

        view.refresh();

        // 트리 그리드는 수동으로 상태정보를 관리해야한다.
        for(let selectedRow of selectedRows) {
            view.itemsAdded.remove(selectedRow);
            view.itemsEdited.remove(selectedRow);
        }

        view.itemsRemoved.push(...selectedRows);

        set({ headerData: [...headerData] });
    },
    saveGridData: (seq) => {
        let view = useHeaderData.getState().gridData;

        if(!confirm("저장하시겠습니까?")) return;

        let added = view.itemsAdded || [];
        let edited = view.itemsEdited || [];
        let removed = view.itemsRemoved || [];


        if(added.length === 0 && edited.length === 0 && removed.length === 0) {
            alert("변경사항이 없습니다.");
            return;
        }

        let cond = {
            added: Array.from(added).map(row => ({ ...row })),
            edited: Array.from(edited).map(row => ({ ...row })),
            removed: Array.from(removed).map(row => ({ ...row }))
        }
        //console.log(cond);
        api.post('/kjoApi/headerTable', cond).then(() => {
            alert("저장되었습니다.");
            useHeaderData.getState().fetchGridData(seq);
            useHeaderData.getState().fetchGridHeaderData(seq);
        });
    },
    fieldData: null,
    fetchFieldData: (seq) => {
        let cond = {
            tableSeq: seq
        }

        api.get('/kjoApi/fieldTable', {params: cond})
            .then((res) => {
                set({ fieldData: res.data });
            }).catch((err) => {
            console.error(err);
        });
    },
    headerData: null,
    fetchHeaderData: (seq) => {
        let cond = {
            tableSeq: seq
        }

        api.get('/kjoApi/headerId', {params: cond})
            .then((res) => {
                set({ headerData: res.data });
            }).catch((err) => {
            console.error(err);
        });
    },
    fieldMatching: () => {
        let view = useHeaderData.getState().gridData;
        let items = useHeaderData.getState().fieldData;

        let sn = 1;
        for(let item of items) {
            let seq = item.colId.split("_")[1];

            let newItem = view.addNew();

            newItem.selected = false;
            newItem.headerId = "HEAD_00" + sn;
            newItem.connField = item.colId;
            newItem.sortSn = sn++;

            view.commitNew();
        }
        view.refresh()
    },
    collapseGrid: () => {
        let gridRef = useHeaderData.getState().gridRef.current.control;
        let data = useHeaderData.getState().gridData.items;

        gridRef.rows.forEach(row => {
            if (row.dataItem && row.dataItem.children) {
                row.isCollapsed = true;
            }
        });
    },
    expendGrid: () => {
        let gridRef = useHeaderData.getState().gridRef.current.control;
        let data = useHeaderData.getState().gridData.items;

        gridRef.rows.forEach(row => {
            if (row.dataItem && row.dataItem.children) {
                row.isCollapsed = false;
            }
        });
    },
    markAsEdited: (item) => {
        let gridData = useHeaderData.getState().gridData;

        let added = gridData.itemsAdded;
        let addedData = added.filter(data => { return data.headerId === item.headerId });

        let edited = gridData.itemsEdited;
        let editedData = edited.filter(data => data.headerId === item.headerId);

        if(addedData?.length === 1) {
            let tmp = added.filter(data => {
                return data.headerId !== item.headerId
            });
            gridData.itemsAdded.splice(0, gridData.itemsAdded.length, ...tmp);
            gridData.itemsAdded.push(item);
        } else if(editedData?.length === 1) {
            let tmp = added.filter(data => {
                return data.headerId !== item.headerId
            });
            gridData.itemsEdited.splice(0,gridData.itemsEdited.length, ...tmp);
            gridData.itemsEdited.push(item);
        } else {
            gridData.itemsEdited.push(item);
        }
    },
    gridHeaderData: null,
    fetchGridHeaderData: (seq) => {
        let cond = {
            tableSeq: seq
        }

        api.get('/kjoApi/gridHeaderTable', {params: cond}).then((res) => {
            set({ gridHeaderData: res.data });
        }).catch((err) => {
            console.error(err);
        });
    }
}));

export default useHeaderData;

