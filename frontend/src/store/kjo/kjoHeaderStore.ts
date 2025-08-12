import {create} from 'zustand';
import api from "@api/api.js";
import {CollectionView} from "@mescius/wijmo";
import type { RefObject } from 'react';
import {FlexGrid as FlexGridType, GroupRow} from '@mescius/wijmo.grid';

interface InitData {
    tableName: string
    tableId: string
}

interface GridData {
    selected: boolean;
    tableSeq: number;
    headerId: string
    headerName: string;
    supiHeader: string;
    headerWidth: number;
    connField: string;
    sortSn: number;
    children?: GridData[] | null;
}

interface FieldData {
    tableSeq: number;
    colId: string;
    colName: string;
    colType: number;
    colSize: number | null;
    colIdx: boolean;
    colSch: boolean;
    selected: boolean;
}

interface HeaderData {
    headerId: string;
    headerName: string;
}

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

interface UseHeaderData{
    gridRef: RefObject<{control: FlexGridType}> | null
    setGridRef: (ref: RefObject<{control: FlexGridType}>) => void
    initData: InitData | null
    fetchInitData: (seq: string) => void
    gridData: CollectionView<GridData> | null
    fetchGridData: (seq: string) => void
    addRow: (seq: string) => void
    deleteRow: () => void
    saveGridData: (seq: string) => void
    fieldData: FieldData[] | null
    fetchFieldData: (seq: string) => void
    headerData: HeaderData[] | null
    fetchHeaderData: (seq: string) => void
    fieldMatching: () => void
    collapseGrid: () => void
    expendGrid: () => void
    markAsEdited: (item: GridData) => void
    gridHeaderData: GridHeaderData[] | null
    fetchGridHeaderData: (seq: string) => void
}

const useHeaderData = create<UseHeaderData>((set) => ({
    gridRef: null,
    setGridRef: (ref) => set({ gridRef: ref }),
    initData: null,
    fetchInitData: (seq) => {
        const cond = {
            tableSeq: seq
        };

        api.get<InitData>('/kjoApi/tableName', {params: cond})
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

        api.get<GridData[]>('/kjoApi/headerTable', {params: cond})
            .then((res) => {
                if(res.data.length === 0) {
                    const fieldMatching = document.getElementById("fieldMatching") as HTMLInputElement | null ;
                    if(fieldMatching) fieldMatching.style.display = "block";
                } else {
                    const fieldMatching = document.getElementById("fieldMatching") as HTMLInputElement | null ;
                    if(fieldMatching) fieldMatching.style.display = "none";
                }

                set({ gridData: new CollectionView(res.data, { trackChanges: true }) });
            }).catch((err) => {
            console.error(err);
        });
    },
    addRow: (seq) => {
        const headerData = useHeaderData.getState().headerData;
        const view = useHeaderData.getState().gridData;

        if(!view || !headerData) return;

        const newItem = view.addNew();
        const row = headerData.length-1;

        if(row === -1) {
            newItem.headerId = "HEAD_001";
            newItem.sortSn = 1;
        } else {
            const num = headerData[row]?.headerId?.split("_")[1] ?? "";
            const n = Number(num)+1;

            newItem.headerId = "HEAD_" + String(n).padStart(3,"0");
            newItem.sortSn = n;
        }

        newItem.selected = false;
        newItem.tableSeq = Number(seq);

        view.commitNew();

        headerData.push(<HeaderData>newItem);

        set({ headerData: [...headerData] });
    },
    deleteRow: () => {
        const headerData = useHeaderData.getState().headerData;
        //let gridRef = useHeaderData.getState().gridRef.current.control;
        const view = useHeaderData.getState().gridData;

        if(!view || !headerData) return;

        const data = view.items as GridData[];
        const selectedRows: GridData[] = [];

        function findSelectedRow(data: GridData[]): GridData[] {
            const result: GridData[] = [];

            data.forEach(node => {
                const filteredChildren = findSelectedRow(node.children || []);

                if (!node.selected) {
                    result.push({ ...node, children: filteredChildren });
                } else {
                    selectedRows.push(node);
                }
            });

            return result;
        }

        const newGridData = findSelectedRow(data);

        if(selectedRows.length === 0) {
            alert("삭제할 행을 선택해주세요.");
            return;
        }

        const source= view.sourceCollection;
        source.splice(0, source.length, ...newGridData);

        view.refresh();

        // 트리 그리드는 수동으로 상태정보를 관리해야한다.
        for(const selectedRow of selectedRows) {
            view.itemsAdded.remove(selectedRow);
            view.itemsEdited.remove(selectedRow);
        }

        view.itemsRemoved.push(...selectedRows);

        set({ headerData: [...headerData] });
    },
    saveGridData: (seq) => {
        const view = useHeaderData.getState().gridData;

        if(!confirm("저장하시겠습니까?")) return;

        const added = view?.itemsAdded || [];
        const edited = view?.itemsEdited || [];
        const removed = view?.itemsRemoved || [];


        if(added.length === 0 && edited.length === 0 && removed.length === 0) {
            alert("변경사항이 없습니다.");
            return;
        }

        const cond = {
            added: Array.from(added).map(row => ({ ...row })),
            edited: Array.from(edited).map(row => ({ ...row })),
            removed: Array.from(removed).map(row => ({ ...row }))
        }

        api.post('/kjoApi/headerTable', cond).then(() => {
            alert("저장되었습니다.");
            useHeaderData.getState().fetchGridData(seq);
            useHeaderData.getState().fetchGridHeaderData(seq);
        }).catch((err) => {
            console.error(err);
        });
    },
    fieldData: null,
    fetchFieldData: (seq) => {
        const cond = {
            tableSeq: seq
        }

        api.get<FieldData[]>('/kjoApi/fieldTable', {params: cond})
            .then((res) => {
                set({ fieldData: res.data });
            }).catch((err) => {
            console.error(err);
        });
    },
    headerData: null,
    fetchHeaderData: (seq) => {
        const cond = {
            tableSeq: seq
        }

        api.get<HeaderData[]>('/kjoApi/headerId', {params: cond})
            .then((res) => {
                set({ headerData: res.data });
            }).catch((err) => {
            console.error(err);
        });
    },
    fieldMatching: () => {
        const view = useHeaderData.getState().gridData;
        const items = useHeaderData.getState().fieldData;
        const headerData = useHeaderData.getState().headerData || [];

        if(!view || !items) return;

        let sn = 1;
        for(const item of items) {
            const newItem = view.addNew();

            newItem.selected = false;
            newItem.tableSeq = Number(item.tableSeq);
            newItem.headerId = "HEAD_00" + sn;
            newItem.headerName = item.colName;
            newItem.headerWidth = 50;
            newItem.connField = item.colId;
            newItem.sortSn = sn++;

            headerData.push(<HeaderData>newItem);

            view.commitNew();
        }
        set({ headerData: [...headerData] });
        view.refresh()
    },
    collapseGrid: () => {
        const gridRef = useHeaderData.getState().gridRef?.current?.control;

        if(!gridRef) return;

        gridRef.rows.forEach(row => {
            const dataItem = row.dataItem as GridData | undefined;
            if (dataItem?.children) {
                (row as GroupRow).isCollapsed = true;
            }
        });
    },
    expendGrid: () => {
        const gridRef = useHeaderData.getState().gridRef?.current?.control;

        if(!gridRef) return;

        gridRef.rows.forEach(row => {
            const dataItem = row.dataItem as GridData | undefined;
            if (dataItem?.children) {
                (row as GroupRow).isCollapsed = false;
            }
        });
    },
    markAsEdited: (item) => {
        const gridData = useHeaderData.getState().gridData;

        if(!gridData) return;

        const added = gridData.itemsAdded;
        const addedData = added.filter(data => { return data.headerId === item.headerId });

        const edited = gridData.itemsEdited;
        const editedData = edited.filter(data => data.headerId === item.headerId);

        if(addedData?.length === 1) {
            const tmp = added.filter(data => {
                return data.headerId !== item.headerId
            });
            gridData.itemsAdded.splice(0, gridData.itemsAdded.length, ...tmp);
            gridData.itemsAdded.push(item);
        } else if(editedData?.length === 1) {
            const tmp = added.filter(data => {
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
        const cond = {
            tableSeq: seq
        }

        api.get<GridHeaderData[]>('/kjoApi/gridHeaderTable', {params: cond}).then((res) => {
            set({ gridHeaderData: res.data });
        }).catch((err) => {
            console.error(err);
        });
    }
}));

export default useHeaderData;

