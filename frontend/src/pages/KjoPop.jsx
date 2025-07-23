import "./kjoPop.css";
import {useState, useEffect, useRef} from "react";

import BaseButton from '../components/BaseButton.jsx';
import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko' ;

import { DataMap } from '@mescius/wijmo.grid';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';

import useCommonData from "../store/commonStore.js";
import useColData from "../store/kjoPopupStore.js";
import useEvent from "react-use-event-hook";

const params = new URLSearchParams(window.location.search);
const tableSeq = params.get('tableSeq');

const temp = () => {
    console.log("temp");
}

const Header = () => {
    const { saveColData } = useColData();

    return (
        <div className={"header_line"}>
            <div className={"content_title"}>테이블 정의</div>
            <div className={"button_box"}>
                <BaseButton txt={"저장"} onClick={() => saveColData(tableSeq)}/>
            </div>
        </div>
    )
}

const TableInfoArea = () => {
    const {initData} = useColData();
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
                    <span className={"table_info_span"}>{"이름"}</span>
                </div>
                <input type="text" id={"tableNm"} className={"text_box"} defaultValue={data.tableName} style={{width: 300}}></input>
            </div>
            <div className={"table_info"}>
                <div className={"table_info_cell"}>
                    <span className={"table_info_span"}>{"ID"}</span>
                </div>
                <input type="text" id={"tableId"} className={"text_box"} defaultValue={data.tableId} style={{width: 300}} ></input>
            </div>
        </div>
    )
}

const ColGridHeader = () => {
    const { addGridData, deleteGridData } = useColData();
    return (
        <div className={"col_grid_header"}>
            <div className={"sub_content_title"}>필드 속성 정의</div>
            <div className={"button_box"}>
                <BaseButton txt={"행추가"} onClick={() => addGridData(tableSeq)}/>
                <BaseButton txt={"행삭제"} onClick={() => deleteGridData()}/>
            </div>
        </div>
    )
}
const ColGridArea = ({commCode}) => {
    const { setGridRef, gridData } = useColData();
    const gridRef = useRef(null);

    let code = null;
    if(commCode != null) {
        code = new DataMap(commCode, 'COM_CD', 'COM_CD_NM');
    }

    useEffect(() => {
        if (gridRef)
            setGridRef(gridRef); // FlexGrid 컨트롤 등록
    }, []);

    const flexInitialized = useEvent((grid) => {
        grid.beginningEdit.addHandler((s, e) => {
            let col = s.columns[e.col];
            let value = s.getCellData(e.row, 'colType', false);

            if (col.binding === 'colSize' && value !== "2") {
                e.cancel = true;
            }
        });

        grid.cellEditEnded.addHandler((s, e) => {
            let col = s.columns[e.col];
            let value = s.getCellData(e.row, 'colType', false);

            if(col.binding === 'colType' && value !== "2") {
                s.setCellData(e.row, 'colSize', null);
            }

            if(col.binding === 'colSize' && value === "2") {
                const regex = /[^0-9]/;
                let size = s.getCellData(e.row, 'colSize', false);

                if(regex.test(size)) {
                    s.setCellData(e.row, 'colSize', null);
                    alert("숫자만 입력 가능합니다.");
                }
            }
        });

    })

    return (
        <div className={"col_grid_area"}>
            <FlexGrid
                ref = {gridRef}
                itemsSource={gridData}
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
        </div>
    )
}

const KjoPop = () =>{
    const { commCode, fetchAllData } = useCommonData();
    const { fetchInitData, fetchGridData } = useColData();

    useEffect(() => {
        const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');

        if (link) {
            link.remove();
        }

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