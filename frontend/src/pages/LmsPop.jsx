import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css'
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import api from './../api/api.js';
import {FlexGrid,FlexGridColumn } from '@mescius/wijmo.react.grid';
import { CollectionView } from '@mescius/wijmo';
import * as wjInput from '@mescius/wijmo.react.input';
import { useState,useEffect, useRef } from "react";
import { Button, Flex, Modal, message } from 'antd';



    const data = [
    { tableName1: 'Artist Album list', tableName2: 'uda_0122_db', count: 25, user : "이민수", date : '2025-07-10',selected: false },
    { tableName1: 'sw 통합결재', tableName2: 'uda_0132_db', count: 20, user : "김정욱", date : '2025-07-11',selected: false },
    { tableName1: '회의실 현황', tableName2: 'uda_0124_db', count: 10, user : "문재선", date : '2025-07-12',selected: false },
    { tableName1: '금속재료조회', tableName2: 'uda_0125_db', count: 5, user : "김진한", date : '2025-07-13',selected: false },
    { tableName1: '배출가스', tableName2: 'uda_0127_db', count: 2, user : "한은영", date : '2025-07-14',selected: false },
    { tableName1: '테스트', tableName2: 'uda_0128_db', count: 1, user : "홍민기", date : '2025-07-15',selected: false },
    ];

const LmsPop = () =>{
  const params = new URLSearchParams(window.location.search);
  const tableSeq = params.get('tableSeq');
  const gridRef = useRef(null);
  const [cv, setCv] = useState(data);

  console.log(tableSeq);
  return (
    <div style={{padding : '10px',background : 'white'}}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 10px 0' }}>
            <Flex gap="small" wrap>
                <Button className="custom-button" >저장</Button>
                <Button className="custom-button" onClick={() => window.close()}>닫기</Button>
            </Flex>
        </div>
        <div className='formWrap'>
            <span>물리테이블 명 </span>
            <input style={{ width : '300px', height :'28px' ,border : '1px solid #dbdbdb', fontSize : '12px'}} placeholder=' 물리 테이블 명을 입력하세요.'/>
            <span>논리테이블 명</span>
            <input style={{ width : '300px', height :'28px' ,border : '1px solid #dbdbdb', fontSize : '12px'}} placeholder=' 논리 테이블 명을 입력하세요.'/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 10px 0' }}>
            <Flex gap="small" wrap>
                <Button className="custom-button" >행추가</Button>
                <Button className="custom-button" >행삭제</Button>
                <Button className="custom-button" >저장</Button>
            </Flex>
        </div> 
        <div style={{ margin: '2px' }}>
            <FlexGrid
            ref={gridRef}
            itemsSource={cv}
            isReadOnly={false}
            autoGenerateColumns={false}
            style={{ height: '400px' }}
            selectionMode="Row"
            headersVisibility="Column"
            allowSorting={true}
            >
                <FlexGridColumn binding="selected" header="선택" width={50} dataType="Boolean" />
                <FlexGridColumn binding="TABLE_NAME" header="논리 테이블명" width="*"/> 
                <FlexGridColumn binding="TABLE_ID" header="물리 테이블명" width="*"  />
                <FlexGridColumn binding="field_count" header="데이터 수" width="0.4*" isReadOnly={true} />
                <FlexGridColumn binding="VBG_CRE_USER" header="생성자" width="*" isReadOnly={true}  />
                <FlexGridColumn binding="VBG_CRE_DTM" header="수정일" width="0.5*" align="center" isReadOnly={true}  />
                <FlexGridColumn binding="TABLE_SEQ" header="SEQ" visible={false} />
            </FlexGrid>
        </div>
    </div>
  );
}

export default LmsPop;