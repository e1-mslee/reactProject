import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css'
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import axios from "axios";
import {FlexGrid} from '@mescius/wijmo.react.grid';
import * as wjInput from '@mescius/wijmo.react.input';
import { useState,useEffect } from "react";
import { Button, Flex } from 'antd';

const Lms = () =>{

    const [commCode, setCommCode] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        Promise.all([
            axios.get('http://localhost:8080/api/commCode'),
            axios.get('http://localhost:8080/api/getMainTableInfo')
        ])
        .then(([commCodeRes, dataRes]) => {
            setCommCode(commCodeRes.data);
            setData(dataRes.data);
            setGridData(dataRes.data);
        })
        .catch((err) => {
            console.error(err);
        });
    }, []);

    // const data = [
    // { tableName1: 'Artist Album list', tableName2: 'uda_0122_db', count: 25, user : "이민수", date : '2025-07-10',selected: false },
    // { tableName1: 'sw 통합결재', tableName2: 'uda_0132_db', count: 20, user : "김정욱", date : '2025-07-11',selected: false },
    // { tableName1: '회의실 현황', tableName2: 'uda_0124_db', count: 10, user : "문재선", date : '2025-07-12',selected: false },
    // { tableName1: '금속재료조회', tableName2: 'uda_0125_db', count: 5, user : "김진한", date : '2025-07-13',selected: false },
    // { tableName1: '배출가스', tableName2: 'uda_0127_db', count: 2, user : "한은영", date : '2025-07-14',selected: false },
    // { tableName1: '테스트', tableName2: 'uda_0128_db', count: 1, user : "홍민기", date : '2025-07-15',selected: false },
    // ];

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [gridData, setGridData] = useState(data);

    const handleAddRow = () => {
        const newRow = {
            tableName1: '',
            tableName2: '',
            count: '',
            user: '',
            date: new Date().toISOString().split('T')[0], // 오늘 날짜
            selected: false
        };
        
        setGridData(prev => [...prev, newRow]);
    };

    return <div>
                <span style={{fontSize :'22px',fontWeight : 'bold'}}>UDA 목록</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 10px 0' }}>
                    <Flex gap="small" wrap>
                        <Button className="custom-button">조회</Button>
                        <Button className="custom-button" onClick={handleAddRow}>추가</Button>
                        <Button className="custom-button">수정</Button>
                        <Button className="custom-button">저장</Button>
                        <Button className="custom-button">삭제</Button>
                        <Button className="custom-button">엑셀</Button>
                    </Flex>
                </div>
                <div className='formWrap'>
                    <span>검색조건</span>
                    <input style={{ width : '300px', height :'28px' ,border : '1px solid #dbdbdb'}} placeholder='검색조건을 입력하세요.'/>
                    <span>수정일</span>
                    <wjInput.InputDate  valueChanged={(date) => setStartDate(date)}  className='datepicker'/>                   
                    <span style={{width : '10px'}}>~</span>
                    <wjInput.InputDate  valueChanged={(date) => setEndDate(date)}  className='datepicker'/>
                </div>
                <div style={{ margin: '2px' }}>
                    <FlexGrid
                        itemsSource={gridData}
                        columns={[
                        { binding: 'selected', header: '선택', width: 50, isReadOnly: false, dataType: 'Boolean' },
                        { binding: 'TABLE_NAME', header: '논리 테이블명', width: '*' },
                        { binding: 'TABLE_ID', header: '물리 테이블명', width: '*' },
                        { binding: 'field_count', header: '데이터 수', width: '0.4*' },
                        { binding: 'VBG_CRE_USER', header: '생성자', width: '*' },
                        { binding: 'VBG_CRE_DTM', header: '생성일', width: '0.7*', align: 'center' },
                        ]}
                        isReadOnly={false}
                        style={{ height: '520px' }}  // ← 여기서 높이 지정
                        selectionMode="Row"
                        headersVisibility="Column"
                        allowSorting={true}
                        autoGenerateColumns={false}
                    />
                </div>
            </div>;
}

export default Lms;