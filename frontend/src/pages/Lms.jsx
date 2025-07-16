import '@mescius/wijmo.styles/wijmo.css';
import './Lms.css'
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import {FlexGrid} from '@mescius/wijmo.react.grid';
import DatePicker from "react-datepicker";
import { useState } from "react";
import { Button, Flex } from 'antd';

const Lms = () =>{

    const data = [
    { tableName1: 'Artist Album list', tableName2: 'uda_0122_db', count: 25, user : "이민수", date : '2025-07-10',selected: false },
    { tableName1: 'sw 통합결재', tableName2: 'uda_0132_db', count: 20, user : "김정욱", date : '2025-07-11',selected: false },
    { tableName1: '회의실 현황', tableName2: 'uda_0124_db', count: 10, user : "문재선", date : '2025-07-12',selected: false },
    { tableName1: '금속재료조회', tableName2: 'uda_0125_db', count: 5, user : "김진한", date : '2025-07-13',selected: false },
    { tableName1: '배출가스', tableName2: 'uda_0127_db', count: 2, user : "한은영", date : '2025-07-14',selected: false },
    { tableName1: '테스트', tableName2: 'uda_0128_db', count: 1, user : "홍민기", date : '2025-07-15',selected: false },
    ];

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
                <h2>UDA 목록</h2>
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
                    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className='datepicker' dateFormat="yyyy-MM-dd" />
                    <span style={{width : '10px'}}>~</span>
                    <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className='datepicker'  dateFormat="yyyy-MM-dd"  />  
                </div>
                <div style={{ margin: '2px' }}>
                    <FlexGrid
                        itemsSource={gridData}
                        columns={[
                        { binding: 'selected', header: ' ', width: 40, isReadOnly: false, dataType: 'Boolean' },
                        { binding: 'tableName1', header: '논리 테이블명', width: '*' },
                        { binding: 'tableName2', header: '물리 테이블명', width: '*' },
                        { binding: 'count', header: '데이터 수', width: '0.4*' },
                        { binding: 'user', header: '생성자', width: '*' },
                        { binding: 'date', header: '생성일', width: '0.7*', align: 'center'  },
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