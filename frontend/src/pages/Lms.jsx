import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css'
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import api from './../api/api.js';
import {FlexGrid,FlexGridColumn} from '@mescius/wijmo.react.grid';
import * as wjInput from '@mescius/wijmo.react.input';
import { useState,useEffect } from "react";
import { Button, Flex } from 'antd';

const Lms = () =>{
    const [commCode, setCommCode] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchGridData();
    }, []);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [gridData, setGridData] = useState([]);

    const handleAddRow = () => {
        const newRow = {
            TABLE_NAME: '',
            TABLE_ID: '',
            field_count: '',
            VBG_CRE_USER: '',
            VBG_CRE_DTM: new Date().toISOString().split('T')[0], // 오늘 날짜
            selected: false
        };
        
        setGridData(prev => [...prev, newRow]);
    };

    const fetchGridData = async () => {
        try {
            const res = await api.get('/api/getMainTableInfo');
            console.log(res.data);
            setData(res.data);
            setGridData(res.data);
        } catch (err) {
            console.error('데이터 불러오기 오류:', err);
            alert('데이터 로딩 중 문제가 발생했습니다.');
        }
    };

    const deleteData = async () => {
        const selectedRows = gridData.filter((row) => row.selected);

        if (selectedRows.length === 0) {
            alert('삭제할 항목을 선택하세요.');
            return;
        }

        const idsToDelete = selectedRows.map((row) => row.TABLE_SEQ);
        console.log("idsToDelete",idsToDelete)
        try {
            await api.post('/api/deleteMainTableInfo', idsToDelete);
            alert('삭제되었습니다.');
            await fetchGridData();
        } catch (err) {
            console.error('삭제 오류:', err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };


    return <div>
                <span style={{fontSize :'22px',fontWeight : 'bold'}}>UDA 목록</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 10px 0' }}>
                    <Flex gap="small" wrap>
                        <Button className="custom-button" onClick={fetchGridData}>조회</Button>
                        <Button className="custom-button" onClick={handleAddRow}>추가</Button>
                        <Button className="custom-button">수정</Button>
                        <Button className="custom-button">저장</Button>
                        <Button className="custom-button" onClick={deleteData}>삭제</Button>
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
                    isReadOnly={false}
                    autoGenerateColumns={false}
                    style={{ height: '540px' }}
                    selectionMode="Row"
                    headersVisibility="Column"
                    allowSorting={true}
                    >
                        <FlexGridColumn binding="selected" header="선택" width={50} dataType="Boolean" />
                        <FlexGridColumn binding="TABLE_NAME" header="논리 테이블명" width="*" cssClass="blue-column" />
                        <FlexGridColumn binding="TABLE_ID" header="물리 테이블명" width="*" />
                        <FlexGridColumn binding="field_count" header="데이터 수" width="0.4*" />
                        <FlexGridColumn binding="VBG_CRE_USER" header="생성자" width="*" />
                        <FlexGridColumn binding="VBG_CRE_DTM" header="생성일" width="0.5*" align="center" />
                        <FlexGridColumn binding="TABLE_SEQ" header="SEQ" visible={false} />
                    </FlexGrid>
                </div>
                <span style={{fontSize : '13px', fontWeight : 'bold', marginLeft : '5px'}}> TOTAL : {data.length || 0} </span>    
            </div>;
}

export default Lms;