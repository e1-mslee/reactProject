import "./kjo.css";
import {useEffect, useRef, useState} from "react";

import BaseButton from '../components/BaseButton.jsx';
import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';

import {DataMap} from '@mescius/wijmo.grid';
import {FlexGrid, FlexGridColumn} from '@mescius/wijmo.react.grid';
import * as wjGrid from '@mescius/wijmo.grid';

import useEvent from "react-use-event-hook";
import useHeaderData from "@store/kjoHeaderStore.js";
import {CollectionView, toHeaderCase} from "@mescius/wijmo";

const params = new URLSearchParams(window.location.search);
const tableSeq = params.get('tableSeq');

const TmpAreaToggle = () => {
    let display = document.getElementById("TmpArea").style.display;

    if(display === "block")
        document.getElementById("TmpArea").style.display = "none";
    else
        document.getElementById("TmpArea").style.display = "block";
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
    let data;

    if(initData == null) {
        data = {
            tableName: '',
            tableId: ''
        }
    } else {
        data = initData[0];
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
    const gridRef = useRef(null);
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

        function onCollectionChanged(e) {
            if(e?.items?.length === 0)
                document.getElementById("fieldMatching").style.display = "block";
            else
                document.getElementById("fieldMatching").style.display = "none";

            setTotalCnt(gridRef.current.control.rows.length);
        }

        gridData.collectionChanged.addHandler(onCollectionChanged);

        return () => {
            gridData.collectionChanged.removeHandler(onCollectionChanged);
        };
    }, [gridData]);

    const initialGrid = useEvent((grid) => {
        grid.loadedRows.addHandler((s, e) => {
            grid.rows.forEach((row) => {
                row.isReadOnly = false;
            });
            setTotalCnt(gridRef.current.control.rows.length || 0);
        });

        grid.formatItem.addHandler((s, e) => {
            if (e.panel.cellType === 1 && s.activeEditor) {
                if (s.editRange.row === e.row && s.editRange.col === e.col) {
                    return;
                }
            }

            // add custom expand/collapse in another column
            if (e.panel.cellType !== 1) {
                return;
            }

             var col = e.panel.columns[e.col];
             var row = e.panel.rows[e.row];

            // reset padding for first column
            if (col.index === 0) {
                e.cell.style.paddingLeft = null;
                // remove buttons from first column
                e.cell.innerHTML = '';
            }

            // add padding for second column
            if (col.binding === 'headerId') {
                let padding = row.level * 14;
                if (!row.hasChildren) {
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
                        row.dataItem.headerId +
                        '';
                }
                e.cell.style.paddingLeft = padding + 'px';
            }
        });

        grid.beginningEdit.addHandler((s, e) => {
            let col = e.panel.columns[e.col];

            if(col.binding === 'connField' && e.panel.cellType === 1) {
                let headerId = s.getCellData(e.row, 'headerId');
                let childRows = s.rows.find(d => d.dataItem.supiHeader === headerId);

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

            if(col.binding === 'supiHeader' && e.panel.cellType === 1) {
                let supiHeader = col.dataMap.getKeyValue(editorValue);
                let supiRow = s.rows.find(d => d.dataItem.headerId === supiHeader);

                if(supiRow) {
                    e.cancel = true;
                    alert("연결필드가 있는 행은 선택할 수 없습니다.");
                    return;
                }
            }

            if(col.binding === 'connField' && e.panel.cellType === 1) {
                let connField = col.dataMap.getKeyValue(editorValue);
                let childRows = s.rows.find(d => d.dataItem.connField === connField);

                if(childRows) {
                    e.cancel = true;
                    alert("연결 필드는 중복 선택할 수 없습니다.");
                    return;
                }
            }
        })

        grid.cellEditEnded.addHandler((s, e) => {
            let col = e.panel.columns[e.col];
            let oriData = s.rows[e.row].dataItem;
            let cellData = s.getCellData(e.row, 'selected');

            markAsEdited(oriData);


            if(col.binding !== 'selected' || e.panel.cellType !== 1) return;

            const findSupiRow = (supiHeader) => {
                for(let i = 0; i < e.row; i++) {
                    let data = s.rows[i].dataItem;

                    if(supiHeader === data.headerId && cellData) {
                        s.setCellData(i, 'selected', cellData);
                        if(data.supiHeader !== null || data.supiHeader !== '')
                            findSupiRow(data.supiHeader);
                        return;
                    }
                }
            }

            const findChildRow = (children) => {
                if(children == null || children.length === 0) return;

                for(let child of children) {
                    for(let i = e.row+1; i < s.rows.length; i++) {
                        let data = s.rows[i].dataItem;
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
                itemsSource={gridData}
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
    const tmpGridRef = useRef(null);

    useEffect(() => {
        if(!tmpGridRef || !gridHeaderData || gridHeaderData.length === 0) return;

        let grid = tmpGridRef.current.control;
        let deptList = gridHeaderData.map((col) => col.dept);
        let maxDept = Math.max(...deptList);
        let colIdx = new Array(maxDept+1).fill(0);
        let headerList = new Array(maxDept+1);

        let panel = grid.columnHeaders;
        panel.rows.splice(0, panel.rows.length-1);

        for(let i = 0; i < maxDept; i++) {
            let extraRow = new wjGrid.Row();
            extraRow.allowMerging = true;

            // add extra header row to the grid
            panel.rows.splice(0, 0, extraRow);
        }

        grid.columns.clear(); // 기존 열 제거

        gridHeaderData.filter((col) => col.child === 0 && col.dept === maxDept).forEach((col) => {
            grid.columns.push(new wjGrid.Column({ binding: col.headerId, header: col.headerName, width: col.headerWidth, allowMerging: true}));
        });

        for(let header of gridHeaderData) {
            if(typeof headerList[header.dept] === 'undefined') {
                headerList[header.dept] = new Array();
            }

            for(let i = 0; i < header.cellSize; i++) {
                headerList[header.dept].push(header.headerId);
            }
        }

        for(let i = 0; i < headerList.length; i++) {
            for(let j = 0; j < headerList[i].length; j++) {
                let headerId = headerList[i][j];
                let header = gridHeaderData.filter((col) => col.headerId === headerId && col.dept === i)[0];

                panel.setCellData(header.dept, j, header.headerName);
            }
        }

        //
        // center-align merged header cells
        function tmpGridFormat(s, e) {
            if (e.panel === s.columnHeaders && e.range.rowSpan > 1) {
                let html = e.cell.innerHTML;
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