import "./kjo.css";
import {useEffect, useRef, useState} from "react";
import useEvent from "react-use-event-hook";

import BaseButton from '@component/BaseButton.jsx';

import { DataMap } from '@mescius/wijmo.grid';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import * as wjGrid from '@mescius/wijmo.grid';

import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko' ;

import useCommonData from "@store/commonStore";
import useColData from "@store/kjo/kjoPopupStore";

import { useRemoveWijmoLink } from "@hooks/useRemoveWijmoLink";

const params = new URLSearchParams(window.location.search);
const tableSeq = params.get('tableSeq') || "";

const Header = () => {
    const { saveColData, headerPopup } = useColData();

    return (
        <div className={"header_line"}>
            <div className={"content_title"}>테이블 정의</div>
            <div className={"button_box"}>
                <BaseButton txt={"헤더관리"} onClick={() => headerPopup(tableSeq)}/>
                <BaseButton txt={"저장"} onClick={() => saveColData(tableSeq)}/>
            </div>
        </div>
    )
}

const TableInfoArea = () => {
    const {initData} = useColData();

    interface InitData {
        tableName: string;
        tableId: string;
    }
    let data: InitData = {
        tableName: '',
        tableId: ''
    };

    if(initData) {
        data = initData;
    }

    return (
        <div className={"table_info_area"}>
            <div className={"table_info"}>
                <div className={"table_info_cell"}>
                    <span className={"table_info_span"}>{"이름"}</span>
                </div>
                <input type="text" id={"tableNm"} className={"text_box"} defaultValue={data.tableName} style={{width: 300}}></input>
            </div>
            <div className={"table_info"}>
                <div className={"table_info_cell"}>
                    <span className={"table_info_span"}>{"ID"}</span>
                </div>
                <input type="text" id={"tableId"} className={"text_box"} defaultValue={data.tableId} style={{width: 300}} readOnly={true}></input>
            </div>
        </div>
    )
}

const ColGridHeader = () => {
    const { addGridData, deleteGridData } = useColData();
    return (
        <div className={"grid_header"}>
            <div className={"sub_content_title"}>필드 속성 정의</div>
            <div className={"button_box"}>
                <BaseButton txt={"행추가"} onClick={() => addGridData(tableSeq)}/>
                <BaseButton txt={"행삭제"} onClick={() => deleteGridData()}/>
            </div>
        </div>
    )
}

interface ICode {
    COM_CD_ID: string;
    COM_CD: string;
    COM_CD_NM: string
    COM_CD_EN: string;
    SORT_SN: number;
    CODE_OPTION_NAME: string;
    CODE_OPTION_VALUE: string;
}
interface CommCode {
    commCode: ICode[] | null;
}
const ColGridArea = ({commCode}: CommCode) => {
    const { setGridRef, gridData } = useColData();
    const gridRef = useRef<{control: wjGrid.FlexGrid}>(null);
    const [ totalCnt, setTotalCnt ] = useState(0);

    let code = null;
    if(commCode != null) {
        code = new DataMap(commCode, 'COM_CD', 'COM_CD_NM');
    }

    useEffect(() => {
        if (gridRef)
            setGridRef(gridRef); // FlexGrid 컨트롤 등록

    }, []);

    useEffect(() => {
        const ref = gridRef.current?.control;

        function cellEditEnded(s: wjGrid.FlexGrid, e: wjGrid.CellRangeEventArgs) {
            const col = s.columns[e.col];
            const value = s.getCellData(e.row, 'colType', false) as string;

            if(col?.binding === 'colType') {
                if(value !== "1" && value !== "2") {
                    const codeSize = commCode?.filter(code => code?.COM_CD == value) || [];

                    if(!codeSize) return;

                    if(codeSize[0]?.CODE_OPTION_VALUE !== "input") {
                        s.setCellData(e.row, 'colSize', codeSize[0]?.CODE_OPTION_VALUE, true);
                    }
                } else if(value === "1" || value === "2") {
                    s.setCellData(e.row, 'colSize', '', true);
                }
            }

            if(col?.binding === 'colSize' && (value === "1" || value === "2")) {
                const regex = /[^0-9]/;
                const size = s.getCellData(e.row, 'colSize', false) as string;

                if(regex.test(size)) {
                    s.setCellData(e.row, 'colSize', null);
                    alert("숫자만 입력 가능합니다.");
                }
            }
        }

        ref?.cellEditEnded.addHandler(cellEditEnded);

        return () => {
            ref?.cellEditEnded.removeHandler(cellEditEnded);
        }
    }, [commCode]);

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

    const flexInitialized = useEvent((grid: wjGrid.FlexGrid) => {
        grid.beginningEdit.addHandler((s: wjGrid.FlexGrid, e: wjGrid.CellRangeEventArgs) => {
            const col = s.columns[e.col];
            const value = s.getCellData(e.row, 'colType', false) as string;

            if (col?.binding === 'colSize' && value !== "1" && value !== "2") {
                e.cancel = true;
            }
        });
    });

    return (
        <div className={"grid_area"}>
            <FlexGrid
                ref = {gridRef}
                itemsSource={gridData || []}
                initialized={flexInitialized}
                isReadOnly={false}
                style={{ height: '300px' }}
                selectionMode="Row"
                headersVisibility="Column"
                allowSorting={true}
                autoGenerateColumns={false}
            >
                <FlexGridColumn header="선택" binding="selected" width={50} dataType="Boolean"/>
                <FlexGridColumn header="컬럼 ID" binding="colId" width="0.4*" isReadOnly={true}/>
                <FlexGridColumn header="컬럼 명" binding="colName" width="0.6*" />
                <FlexGridColumn header="유형" binding="colType" width="0.3*" dataMap={code}/>
                <FlexGridColumn header="길이" binding="colSize" width="0.4*" dataType="String"/>
                <FlexGridColumn header="필수" binding="colIdx" width={50} dataType="Boolean"/>
                <FlexGridColumn header="검색" binding="colSch" width={50} dataType="Boolean"/>
                <FlexGridColumn header="SEQ" binding="tableSeq" visible={false} />
            </FlexGrid>
            <span> Total: {totalCnt}</span>
        </div>
    )
}

const KjoPop = () =>{
    const { commCode, fetchAllData } = useCommonData();
    const { fetchInitData, fetchGridData } = useColData();

    useRemoveWijmoLink();

    useEffect(() => {
        fetchAllData();
        fetchInitData(tableSeq);
        fetchGridData(tableSeq);

    }, []);

    return (
        <div>
            <Header />
            <TableInfoArea />
            <ColGridHeader />
            <ColGridArea commCode={commCode}/>
        </div>
    );
}

export default KjoPop;