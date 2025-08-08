import "./kjo.css";
import {useEffect, useRef, useState} from "react";
import useEvent from "react-use-event-hook";

import BaseButton from '@component/BaseButton.jsx';
import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';

import {DataMap} from '@mescius/wijmo.grid';
import {FlexGrid, FlexGridColumn} from '@mescius/wijmo.react.grid';
import * as wjGrid from '@mescius/wijmo.grid';

import useHeaderData from "@store/kjo/kjoHeaderStore";

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

const params = new URLSearchParams(window.location.search);
const tableSeq = params.get('tableSeq') || "";

const TmpAreaToggle = () => {
    const display = (document.getElementById("TmpArea") as HTMLInputElement | null)?.style.display || '';

    if(display === "block") {
        const tmpArea = document.getElementById("TmpArea") as HTMLInputElement | null;

        if(tmpArea) tmpArea.style.display = 'none';
    } else {
        const tmpArea = document.getElementById("TmpArea") as HTMLInputElement | null;

        if(tmpArea) tmpArea.style.display = 'block';
    }
}

const Header = () => {
    const { fieldMatching, saveGridData } = useHeaderData();

    return (
        <div className={"header_line"}>
            <div className={"content_title"}>헤더 관리</div>
            <div className={"button_box"}>
                <BaseButton id={"fieldMatching"} txt={"필드 가져오기"} onClick={() => fieldMatching()}/>
                <BaseButton txt={"미리보기"} onClick={TmpAreaToggle}/>
                <BaseButton txt={"저장"} onClick={() => saveGridData(tableSeq)} />
            </div>
        </div>
    );
}

const TableInfo = () => {
    const {initData} = useHeaderData();

    interface InitData {
        tableName: string;
        tableId: string;
    }
    let data: InitData = {
        tableName: '',
        tableId: ''
    };

    if(initData != null && initData.length > 0) {
        if(initData[0] != undefined){
            data = initData[0];
        }
    }

    return (
        <div className={"table_info_area"}>
            <div className={"table_info"}>
                <div className={"table_info_cell"}>
                    <span className={"table_info_span"}>{"테이블 명"}</span>
                </div>
                <input type="text" id={"tableNm"} className={"text_box"} defaultValue={data.tableName} style={{width: 300}} disabled={true}></input>
            </div>
        </div>
    );
}

const GridHeader = () => {
    const { addRow, deleteRow, collapseGrid, expendGrid } = useHeaderData()

    return (
        <div className={"grid_header"}>
            <div className={"sub_content_title"}>필드 속성 정의</div>
            <div className={"button_box"}>
                <BaseButton txt={"접기"} onClick={() => collapseGrid()}/>
                <BaseButton txt={"펼치기"} onClick={() => expendGrid()}/>
                <BaseButton txt={"행추가"} onClick={() => addRow(tableSeq)}/>
                <BaseButton txt={"행삭제"} onClick={() => deleteRow()}/>
            </div>
        </div>
    )
}

const GridArea = () => {
    const { setGridRef, gridData, fieldData, headerData, markAsEdited } = useHeaderData();
    const gridRef = useRef<{control: wjGrid.FlexGrid}>(null);
    const [ totalCnt, setTotalCnt ] = useState(0);

    let header = null;
    if(headerData != null) {
        header = new DataMap(headerData, 'headerId', 'headerName');
    }

    let field = null;
    if(fieldData != null) {
        field = new DataMap(fieldData, 'colId', 'colName');
    }

    useEffect(() => {
        if (gridRef)
            setGridRef(gridRef); // FlexGrid 컨트롤 등록
    }, []);

    useEffect(() => {
        if (!gridData) return;

        function onCollectionChanged() {
            const gridLength = gridData?.items?.length ?? 0;

            setTotalCnt(gridLength);

            if(gridLength === 0) {
                const fieldMatching = document.getElementById("fieldMatching") as HTMLInputElement || null;
                if(fieldMatching) fieldMatching.style.display = "block";
            } else {
                const fieldMatching = document.getElementById("fieldMatching") as HTMLInputElement || null;
                if(fieldMatching) fieldMatching.style.display = "none";
            }
        }

        gridData.collectionChanged.addHandler(onCollectionChanged);

        return () => {
            gridData.collectionChanged.removeHandler(onCollectionChanged);
        };
    }, [gridData]);

    const initialGrid = useEvent((grid: wjGrid.FlexGrid) => {
        grid.loadedRows.addHandler(() => {
            grid.rows.forEach((row) => {
                row.isReadOnly = false;
            });
            setTotalCnt(gridRef?.current?.control.rows.length || 0);
        });

        grid.formatItem.addHandler((s: wjGrid.FlexGrid, e: wjGrid.FormatItemEventArgs) => {

            if (e.panel.cellType === wjGrid.CellType.Cell && s.activeEditor) {
                if (s.editRange.row === e.row && s.editRange.col === e.col) {
                    return;
                }
            }

            // add custom expand/collapse in another column
            if (e.panel.cellType !== wjGrid.CellType.Cell) {
                return;
            }

            const col = e.panel.columns[e.col];
            const row = e.panel.rows[e.row] as wjGrid.GroupRow;

            // reset padding for first column
            if (col?.index === 0) {
                e.cell.style.paddingLeft = "";
                // remove buttons from first column
                e.cell.innerHTML = '';
            }

            // add padding for second column
            if (col?.binding === 'headerId') {
                let padding = row?.level * 14;
                if (!row?.hasChildren) {
                    padding += 20;
                } else {
                    // has child node, add collapse/expand buttons
                    // clear content
                    e.cell.innerHTML = '';
                    // add buttons
                    e.cell.innerHTML = '' +
                        '<button class="wj-btn wj-btn-glyph wj-elem-collapse" tabindex="-1" aria-label="Toggle Group">' +
                        '<span class="' +
                        (row.isCollapsed ? 'wj-glyph-right' : 'wj-glyph-down-right') +
                        '">' +
                        '</span>' +
                        '</button>' +
                        (row.dataItem as GridData).headerId +
                        '';
                }
                e.cell.style.paddingLeft = padding + 'px';
            }
        });

        grid.beginningEdit.addHandler((s, e) => {
            const col = e.panel.columns[e.col];

            if(col?.binding === 'connField' && e.panel.cellType === wjGrid.CellType.Cell) {
                const headerId = s.getCellData(e.row, 'headerId', false) as string;
                const childRows = s.rows.find(d => (d.dataItem as GridData).supiHeader === headerId);

                if(childRows) {
                    e.cancel = true;
                    alert("하위 헤더가 있는 행은 연결 필드를 선택할 수 없습니다.");
                    s.setCellData(e.row, 'connField', null);
                    return;
                }
            }
        });

        grid.cellEditEnding.addHandler((s, e) => {
            const col = s.columns[e.col];
            const editorValue = s.activeEditor?.value;

            if(col?.binding === 'supiHeader' && e.panel.cellType === wjGrid.CellType.Cell) {
                const supiHeader = col?.dataMap?.getKeyValue(editorValue) as string;
                const supiRow = s.rows.find(d => (d.dataItem as GridData).headerId === supiHeader);

                if(supiRow) {
                    e.cancel = true;
                    alert("연결필드가 있는 행은 선택할 수 없습니다.");
                    return;
                }
            }

            if(col?.binding === 'connField' && e.panel.cellType === wjGrid.CellType.Cell) {
                const connField = col?.dataMap?.getKeyValue(editorValue) as string;
                const childRows = s.rows.find(d => (d.dataItem as GridData).connField === connField);

                if(childRows) {
                    e.cancel = true;
                    alert("연결 필드는 중복 선택할 수 없습니다.");
                    return;
                }
            }
        })

        grid.cellEditEnded.addHandler((s, e) => {
            const col = e.panel.columns[e.col];
            const oriData = s.rows[e.row]?.dataItem as GridData;
            const cellData = s.getCellData(e.row, 'selected', false) as string;

            markAsEdited(oriData);

            if(col?.binding !== 'selected' || e.panel.cellType !== wjGrid.CellType.Cell) return;

/*            const findSupiRow = (supiHeader: string) => {
                for(let i = 0; i < e.row; i++) {
                    const data = s.rows[i]?.dataItem as GridData;

                    if(supiHeader === data.headerId && cellData) {
                        s.setCellData(i, 'selected', cellData);
                        if(data.supiHeader !== null || data.supiHeader !== '')
                            findSupiRow(data.supiHeader);
                        return;
                    }
                }
            }*/

            const findChildRow = (children: GridData[] | null | undefined) => {
                if(!children || children.length === 0) return;

                for(const child of children) {
                    for(let i = e.row+1; i < s.rows.length; i++) {
                        const data = s.rows[i]?.dataItem as GridData;
                        if(data.headerId === child.headerId) {
                            s.setCellData(i, 'selected', cellData);
                            findChildRow(data.children);
                        }
                    }
                }
            }

            // 상위 헤더 찾기
            //findSupiRow(oriData.supiHeader);
            findChildRow(oriData.children);
        });

    });

    return (
        <div className={"grid_area"}>
            <FlexGrid
                ref = {gridRef}
                itemsSource={gridData || []}
                initialized={initialGrid}
                isReadOnly={false}
                style={{ height: '300px' }}
                selectionMode="Row"
                headersVisibility="Column"
                allowSorting={true}
                autoGenerateColumns={false}
                childItemsPath={'children'}
            >
                <FlexGridColumn width={0} />
                <FlexGridColumn header="선택" binding="selected" width={50} />
                <FlexGridColumn header="헤더 ID" binding="headerId" width="0.3*" isReadOnly={true} />
                <FlexGridColumn header="헤더 명" binding="headerName" width="0.5*" />
                <FlexGridColumn header="상위 헤더" binding="supiHeader" width="0.3*" dataType="String" dataMap={header} />
                <FlexGridColumn header="넓이" binding="headerWidth" width="0.3*" dataType="Number" />
                <FlexGridColumn header="연결 필드" binding="connField" width="0.3*" dataType="String" dataMap={field} />
                <FlexGridColumn header="정렬 순서" binding="sortSn" width={80} dataType="Number" />
                <FlexGridColumn header="SEQ" binding="tableSeq" visible={false} />
            </FlexGrid>
            <div> Total: {totalCnt}</div>
        </div>
    )
}

const TmpGridHeader = () => {

    return (
        <div className={"grid_header"}>
            <div className={"sub_content_title"}>미리보기</div>
        </div>
    )
}

const TmpGridArea = () => {
    const { gridHeaderData } = useHeaderData();
    const tmpGridRef = useRef<{control: wjGrid.FlexGrid}>(null);

    useEffect(() => {
        if(!tmpGridRef || !gridHeaderData || gridHeaderData.length === 0) return;

        const grid = tmpGridRef?.current?.control;
        const deptList = gridHeaderData.map((col) => col.dept);
        const maxDept = Math.max(...deptList);
        //const colIdx = new Array(maxDept+1).fill(0);
        const headerList: string[][] = new Array<string[]>(maxDept + 1).fill(new Array<string>());
        
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

        gridHeaderData.filter((col) => col.child === 0 && col.dept === maxDept).forEach((col) => {
            grid.columns.push(new wjGrid.Column({ binding: col.headerId, header: col.headerName, width: col.headerWidth, allowMerging: true}));
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

            for(let j = 0; j < headers.length; j++) {
                const headerId = headers[j];
                const header = gridHeaderData.filter((col) => col.headerId === headerId && col.dept === i)[0];

                if(!header) continue;

                panel.setCellData(header.dept, j, header.headerName);
            }
        }

        //
        // center-align merged header cells
        function tmpGridFormat(s: wjGrid.FlexGrid, e: wjGrid.FormatItemEventArgs) {
            if (e.panel === s.columnHeaders && e.range.rowSpan > 1) {
                const html = e.cell.innerHTML;
                e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
            }
        }

        grid.formatItem.addHandler(tmpGridFormat);

        grid.autoGenerateColumns = false;
        grid.itemsSource = [];

        return () => {
            grid.formatItem.removeHandler(tmpGridFormat);
        }
    }, [gridHeaderData]);

    return (
        <div className={"grid_area"}>
            <FlexGrid
                ref={tmpGridRef}
                itemsSource={[]}
                isReadOnly={true}
                style={{ height: '200px' }}
                allowMerging="ColumnHeaders"
                alternatingRowStep={0}
            >
            </FlexGrid>
        </div>
    )
}

const KjoHeaderPopup = () =>{
    const { fetchInitData, fetchGridData, fetchFieldData, fetchHeaderData, fetchGridHeaderData } = useHeaderData();
    useEffect(() => {
        const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');

        if (link) {
            link.remove();
        }

        const link2 = document.querySelector('body>div:last-child');

        if(link2) {
            link2.remove();
        }

        fetchInitData(tableSeq);
        fetchGridData(tableSeq);
        fetchFieldData(tableSeq);
        fetchHeaderData(tableSeq);
        fetchGridHeaderData(tableSeq);
    }, []);

    return (
        <div>
            <Header />
            <TableInfo />
            <GridHeader />
            <GridArea />
            <div id={"TmpArea"} style={{display: "none"}}>
                <TmpGridHeader />
                <TmpGridArea />
            </div>

        </div>
    );
}

export default KjoHeaderPopup;