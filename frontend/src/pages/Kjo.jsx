import "./kjo.css";
import {useState, useEffect, useRef} from "react";
import useEvent from "react-use-event-hook";

import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko' ;

import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import BaseButton from "@component/BaseButton.jsx";

import moment from 'moment';
import 'moment/locale/ko';
import useCommonData from "@store/commonStore.js";
import useGridData from "@store/kjoStroe.js";

const nowTime = moment().format('YYYY-MM-DD');

const HeaderLine = () => {
    const { fetchGridData, addGridData, saveGridData, deleteGridData, exportExcel, openPopup } = useGridData();

    return (
        <div className={"header_line"}>
            <div className={"content_title"}>UDA 목록</div>
            <div className={"button_box"}>
                <BaseButton txt={"조회"} onClick={() => fetchGridData()}/>
                <BaseButton txt={"추가"} onClick={() => addGridData()}/>
                <BaseButton txt={"수정"} onClick={() => openPopup(null)}/>
                <BaseButton txt={"저장"} onClick={() => saveGridData()}/>
                <BaseButton txt={"삭제"} onClick={() => deleteGridData()}/>
                <BaseButton txt={"엑셀"} onClick={() => exportExcel()}/>
            </div>
        </div>
    );
}

const BaseSearchBox = ({id, txt, boxWidth=160}) => {
    const { fetchGridData } = useGridData();

    const keyDown = (ev) => {
        if(ev.keyCode === 13){
            fetchGridData();
        }
    }

    return (
        <div className={"information"}>
            <span className={"information_span"}>{txt}</span>
            <input type="text" id={id} className={"text_box"} style={{width: boxWidth}} onKeyDown={keyDown}></input>
        </div>
    );
}

const CalendarSelect = ({dateId, date}) => {
    const [startDate, setStartDate] = useState(date);

    return (
        <DatePicker
            id={dateId}
            className={"date_box"}
            dateFormat='yyyy-MM-dd'
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showMonthYearDropdown />
    );
};

const BaseSearchDate = ({txt}) => {
    let startDate = moment().subtract(1, 'M').format('YYYY-MM-DD');

    return (
        <div className={"information"}>
            <span className={"information_span"}>{txt}</span>
            <CalendarSelect dateId={"start"} date={new Date(startDate)}/>
            <span className={"hyphen"}>-</span>
            <CalendarSelect dateId={"end"} date={new Date(nowTime)}/>
        </div>
    );
}

const SearchArea = () => {
    return (
        <div className={"information_box"}>
            <BaseSearchBox id={"search"} txt={"검색어"} boxWidth={500} />
            <BaseSearchDate txt={"수정일"} />
        </div>
    );
}



const GridArea = () => {
    const {setGridRef, gridData, fetchGridData, openPopup} = useGridData();
    const gridRef = useRef(null);
    const [ totalCnt, setTotalCnt ] = useState(0);

    useEffect(()=> {
        if (gridRef)
            setGridRef(gridRef); // FlexGrid 컨트롤 등록
        fetchGridData();
    }, []);

    useEffect(() => {
        if (!gridData) return;

        setTotalCnt(gridData.items?.length || 0);

        function onCollectionChanged(e) {
            setTotalCnt(e?.items?.length);
        }

        gridData.collectionChanged.addHandler(onCollectionChanged);

        return () => {
            gridData.collectionChanged.removeHandler(onCollectionChanged);
        };
    }, [gridData]);

    const flexInitialized = useEvent((grid) => {
        grid.addEventListener(grid.hostElement, 'click', (ev) => {
            let ht = grid.hitTest(ev);
            if(ht.cellType !== 1) return;

            let tableNm = grid.getCellData(ht.row, "tableName");
            if(tableNm == null || tableNm === "") return;

            const col = grid.columns[ht.col];
            if(col.binding === "tableName") {
                let tableSeq = grid.getCellData(ht.row, "tableSeq");
                openPopup(tableSeq);
            }
        });
    });

    return (
      <div>
          <FlexGrid
              ref={gridRef}
              itemsSource={gridData}
              initialized={flexInitialized}
              isReadOnly={false}
              style={{ height: '500px' }}
              selectionMode="Row"
              headersVisibility="Column"
              allowSorting={true}
              autoGenerateColumns={false}
          >
              <FlexGridColumn header="선택" binding="selected" width={50} dataType="Boolean" />
              <FlexGridColumn header="논리 테이블명" binding="tableName" width="*" cssClass="click_col" />
              <FlexGridColumn header="물리 테이블명" binding="tableId" width="*" isReadOnly={true} />
              <FlexGridColumn header="데이터 수" binding="dataCount" width="0.3*" isReadOnly={true} />
              <FlexGridColumn header="생성자" binding="vbgCreUser" width="0.4*" isReadOnly={true} />
              <FlexGridColumn header="수정일" binding="vbgCreDtm" width="0.6*" isReadOnly={true} />
              <FlexGridColumn header="SEQ" binding="tableSeq" visible={false} />
          </FlexGrid>
          <span> Total: {totalCnt}</span>
      </div>
    );
}

const Kjo = () =>{
    //Init();
    const { fetchAllData } = useCommonData();

    useEffect(() => {
        const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');

        if (link) {
            link.remove();
        }

        const link2 = document.querySelector('body>div:last-child');

        if(link2) {
            console.log(link2);
            link2.remove();
        }

        fetchAllData();
    }, []);

    return (
        <div>
            <HeaderLine/>
            <SearchArea/>
            <GridArea/>
        </div>
    );
}

export default Kjo;