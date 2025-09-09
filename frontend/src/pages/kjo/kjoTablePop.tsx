import "./kjo.css";
import {useState, useEffect, useRef, type KeyboardEvent} from "react";
import useEvent from "react-use-event-hook";

import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko' ;

import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import * as wjGrid from '@mescius/wijmo.grid';
import { InputDate } from '@mescius/wijmo.input';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import BaseButton from "@component/BaseButton.jsx";

import moment from 'moment';
import useCommonData from "@store/commonStore";
import useTableData from "@store/kjo/kjoTableStore"

import { useRemoveWijmoLink } from "@hooks/useRemoveWijmoLink";

const params = new URLSearchParams(window.location.search);
const tableSeq = params.get("tableSeq") || "";
const tableId = params.get("tableId") || "";

const HeaderLine = () => {
    const { excelUpload, searchRow, addRow, deleteRow, saveRow, excelDown } = useTableData();
    const fileInputRef = useRef();

    const handleButtonClick = () => {
        fileInputRef.current?.click(); // 숨겨둔 input 클릭
      };

    return (
        <div className={"header_line"}>
            <div className={"content_title"}>테이블 목록</div>
            <div className={"button_box"} >
                <BaseButton txt={"엑셀 업로드"} onClick={handleButtonClick}/>
                <input type="file" accept=".xlsx,.xls" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => excelUpload(e, tableId, tableSeq)}/>
                <BaseButton txt={"조회"} onClick={() => searchRow(tableSeq, tableId)} />
                <BaseButton txt={"추가"} onClick={() => addRow()} />
                <BaseButton txt={"삭제"} onClick={() => deleteRow()}/>
                <BaseButton txt={"저장"} onClick={() => saveRow(tableSeq, tableId)}/>
                <BaseButton txt={"엑셀"} onClick={() => excelDown(tableSeq, tableId)}/>
            </div>
        </div>
    );
}

const GridArea = () => {
    const { commCode } = useCommonData();
    const { setGridRef, gridHeaderData, gridFieldData, gridData, fetchGridData } = useTableData();
    const [ totalCnt, setTotalCnt ] = useState(0);
    const gridRef = useRef<{control:wjGrid.FlexGrid}>(null);

    useEffect(()=> {
        if (gridRef)
            setGridRef(gridRef); // FlexGrid 컨트롤 등록
        fetchGridData(tableSeq, tableId);
    }, []);

    useEffect(() => {
        if(!gridRef || !gridHeaderData || gridHeaderData.length === 0 ||
            !gridFieldData || gridFieldData.length === 0 ||
            !commCode || commCode.length === 0) return;

        const grid = gridRef?.current?.control;
        const deptList = gridHeaderData.map((col) => col.dept);
        const maxDept = Math.max(...deptList);
        const headerList: string[][] = [];

        if(!grid) return;

        const panel = grid.columnHeaders;
        panel.rows.splice(0, panel.rows.length-1);

        for(let i = 0; i < maxDept; i++) {
            const extraRow = new wjGrid.Row();
            extraRow.allowMerging = true;

            // add extra header row to the grid
            panel.rows.splice(0, 0, extraRow);
        }

        grid.columns.clear(); // 기존 열 제거

        grid.columns.push(new wjGrid.Column({ binding: "selected", header: "선택", width: 50, dataType: "Boolean", allowMerging: true }));

        gridHeaderData.filter((col) => col.child === 0 && col.dept === maxDept).forEach((col) => {
            const filterData = gridFieldData.filter(d => d?.colId === col.connField)[0];
            if(!filterData) return;

            const filterCommData = commCode.filter(d => d.COM_CD === filterData.colType && d.COM_CD_ID === "00001")[0];
            if(!filterCommData) return;

            if(filterCommData.COM_CD_EN === "DATE") {
                grid.columns.push(new wjGrid.Column({ binding: col.connField, header: col.headerName, width: col.headerWidth, editor: new InputDate(document.createElement('div')), allowMerging: true }));
            } else if(filterCommData.COM_CD === "6") {
                grid.columns.push(new wjGrid.Column({ binding: col.connField, header: col.headerName, width: col.headerWidth, dataType: "Boolean", allowMerging: true}));
            } else {
                grid.columns.push(new wjGrid.Column({ binding: col.connField, header: col.headerName, width: col.headerWidth, dataType: "String", allowMerging: true}));
            }
        });

        for(const header of gridHeaderData) {
            if(typeof headerList[header.dept] === 'undefined') {
                headerList[header.dept] = [];
            }

            for(let i = 0; i < header.cellSize; i++) {
                headerList[header.dept]?.push(header.headerId);
            }
        }

        for(let i = 0; i < headerList.length; i++) {
            const headers = headerList[i];

            if(!headers) continue;

            panel.setCellData(i, 0, "선택");
            for(let j = 0; j < headers.length; j++) {
                const headerId = headers[j];
                const header = gridHeaderData.filter((col) => col.headerId === headerId && col.dept === i)[0];

                if(!header) continue;

                panel.setCellData(header.dept, j+1, header.headerName);
            }
        }

        // center-align merged header cells
        function tmpGridFormat(s: wjGrid.FlexGrid, e: wjGrid.FormatItemEventArgs) {
            if (e.panel === s.columnHeaders && e.range.rowSpan > 1) {
                const html = e.cell.innerHTML;
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
        }

        grid.formatItem.addHandler(tmpGridFormat);

        grid.autoGenerateColumns = false;

        return () => {
            grid.formatItem.removeHandler(tmpGridFormat);
        }
    }, [gridHeaderData, gridFieldData]);

    useEffect(() => {
        const ref = gridRef.current?.control;

        function beginningEdit(s: wjGrid.FlexGrid, e: wjGrid.CellRangeEventArgs) {
            const col = s.columns[e.col];
            const value = s.getCellData(e.row, e.col, false) as string;

            if(col.dataType === 3 && value == null) {
                s.setCellData(e.row, e.col, false);
            }
        }

        function cellEditEnded(s: wjGrid.FlexGrid, e: wjGrid.CellRangeEventArgs) {
            const col = s.columns[e.col];
            const value = s.getCellData(e.row, col?.binding, false) as string;

            let filterData = gridFieldData.filter(d => d?.colId === col?.binding)[0];
            if(!filterData) return;


            let filterCommData = commCode.filter(d => d.COM_CD === filterData.colType && d.COM_CD_ID === "00001")[0];
            if(!filterCommData) return;

            switch(filterCommData.COM_CD) {
                case "1":
                    const regex = /[^0-9]/;

                    if(regex.test(value)) {
                        alert("숫자만 입력 가능합니다.");
                        s.setCellData(e.row, e.col, null);
                        return;
                    }

                    if(String(value).length> Number(filterData.colSize)) {
                        alert(`최대 입력 자리수는 ${filterData.colSize}입니다.`);
                        s.setCellData(e.row, e.col, String(value).substr(0, filterData.colSize));
                        return;
                    }
                    break;
                case "2": case "3":
                    if(value.length > filterData.colSize) {
                        alert(`최대 입력 크기는 ${filterData.colSize}입니다.`);
                        s.setCellData(e.row, e.col, value.substr(0, filterData.colSize));
                        return;
                    }
                    break;
                case "4": case "5":
                    break;
                case "6":
                    break;
            }
        };

        ref?.beginningEdit.addHandler(beginningEdit);
        ref?.cellEditEnded.addHandler(cellEditEnded);

        return () => {
            ref?.beginningEdit.addHandler(beginningEdit);
            ref?.cellEditEnded.removeHandler(cellEditEnded);
        }
    }, [gridFieldData]);

    useEffect(() => {
        if (!gridData) return;

        setTotalCnt(gridData.items?.length || 0);

        function onCollectionChanged() {
            if(gridData) setTotalCnt(gridData.items?.length ?? 0);
        }

        gridData.collectionChanged.addHandler(onCollectionChanged);

        return () => {
            gridData.collectionChanged.removeHandler(onCollectionChanged);
        };
    }, [gridData]);

    return (
        <div className={"grid_area"} style={{height: "90%"}}>
            <FlexGrid
                ref={gridRef}
                itemsSource={gridData}
                isReadOnly={false}
                style={{ height: '100%' }}
                allowMerging="ColumnHeaders"
                headersVisibility="Column"
                allowResizing={true}
            >
            </FlexGrid>
            <span> Total: {totalCnt}</span>
        </div>
    )
}

const KjoTablePopup = () =>{
    const { fetchAllData } = useCommonData();
    const { fetchGridHeaderData, fetchGridFieldData, fetchGridData } = useTableData();

    useRemoveWijmoLink();

    useEffect(() => {
        fetchAllData();
        fetchGridHeaderData(tableSeq);
        fetchGridFieldData(tableSeq);
    }, []);

    return (
        <div style={{ height: "100%" }}>
            <HeaderLine />
            <GridArea />
        </div>
    );
}

export default KjoTablePopup;