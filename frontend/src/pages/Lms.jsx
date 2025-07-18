import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css'
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import api from './../api/api.js';
import {FlexGrid,FlexGridColumn} from '@mescius/wijmo.react.grid';
import { CollectionView } from '@mescius/wijmo';
import * as wjInput from '@mescius/wijmo.react.input';
import * as wjcGridXlsx from '@mescius/wijmo.grid.xlsx';
import { useState,useEffect, useRef } from "react";
import { Button, Flex, Modal, message } from 'antd';

const Lms = () =>{
    const [data, setData] = useState([]);
    const [cv, setCv] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const gridRef = useRef(null);

    useEffect(() => {
        fetchGridData();
    }, []);

    const isValidTableName = (name) => {
        const regex = /^[A-Za-z0-9_]{1,10}$/;
        return regex.test(name);
    };

    const handleAddRow = () => {
        if (!cv) return;
        const newRow = {
            TABLE_SEQ : '',
            TABLE_NAME: '',
            TABLE_ID: '',
            field_count: '',
            VBG_CRE_USER: '',
            VBG_CRE_DTM: new Date().toISOString().split('T')[0], // 오늘 날짜
            selected: false
        };
        
        const newItem = cv.addNew();
        Object.assign(newItem, newRow);
        cv.commitNew();
    };

    const fetchGridData = async () => {
        try {
            const res = await api.get('/api/getMainTableInfo');
            setData(res.data);
            const newCv = new CollectionView(res.data, { trackChanges: true });
            setCv(newCv);
        } catch (err) {
            console.error('데이터 불러오기 오류:', err);
        }
    };

    const modifyTableColumn = () => {
        const selectedRows = cv.items.filter(row => row.selected);

        if (selectedRows.length === 0) {
            message.info('수정할 항목을 선택하세요.');
            return;
        } else if(selectedRows.length > 1 ) {
            message.info(' 1개의 항목을 선택하세요.');
            return; 
        }

        console.log("dfdsf");
    };

    const saveTable = async () => {
        if (!cv) return;

        const addedItems = cv.itemsAdded || [];
        const editedItems = cv.itemsEdited || [];
        const newItems = [...addedItems, ...editedItems];

        console.log("newItems", newItems);

        if (newItems.length === 0) {
            message.error('저장할 내용이 없습니다.');
            return;
        }

        for (const item of newItems) {
            if (!item.TABLE_NAME || !item.TABLE_ID) {
                message.error('물리 테이블명과 논리 테이블명은 필수 입력 항목입니다.');
                return;
            }

            if (!isValidTableName(item.TABLE_ID)) {
                message.error('물리 테이블명은 영문, 숫자, 언더스코어(_)만 허용하며 10자 이내로 입력이 가능합니다.');
                return;
            }
            if (item.TABLE_NAME.length > 100) {
                message.error('논리 테이블명은 30자 이내로 입력해주세요.');
                return;
            }

        }


        Modal.confirm({
        title: '알림',
        content: '저장하시겠습니까?',
        style: { top: 200 },
        async onOk() {
            try {
                await api.post('/api/saveMainTableInfo', newItems);
                message.success('저장되었습니다.');
                await fetchGridData(); 
            } catch (error) {
                console.error('저장 오류:', error);
                message.error('저장 중 오류가 발생했습니다.');
            }
        }
        });

    };

    const deleteData = async () => {
        if (!cv) return;
        const selected = cv.items.filter(row => row.selected && row.TABLE_SEQ);
        const seqList = selected.map(row => row.TABLE_SEQ).filter(Boolean);

        if (seqList.length === 0) {
            const filtered = cv.items.filter(row => !row.selected || row.REQ);
            setCv(new CollectionView(filtered, { trackChanges: true }));
            return;
        }


        Modal.confirm({
        title: '알림',
        content: '삭제 하시겠습니까?',
        style: { top: 200 },
        async onOk() {
            try {
                await api.post('/api/deleteMainTableInfo', seqList);
                message.success('삭제되었습니다');
                fetchGridData();
            } catch (err) {
                console.error('삭제 오류:', err);
                message.error('삭제 중 오류 발생');
            }
        }
        });

    };

    const exportToExcel = () => {
        console.log(gridRef.current);
        wjcGridXlsx.FlexGridXlsxConverter.saveAsync(gridRef.current.control, {
            includeStyles: false,
        }, 'FlexGrid.xlsx');

    };

    return <div>
                <span style={{fontSize :'22px',fontWeight : 'bold'}}>UDA 목록</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 10px 0' }}>
                    <Flex gap="small" wrap>
                        <Button className="custom-button" onClick={fetchGridData}>조회</Button>
                        <Button className="custom-button" onClick={handleAddRow}>추가</Button>
                        <Button className="custom-button" onClick={modifyTableColumn}>수정</Button>
                        <Button className="custom-button" onClick={saveTable}>저장</Button>
                        <Button className="custom-button" onClick={deleteData}>삭제</Button>
                        <Button className="custom-button" onClick={exportToExcel}>엑셀</Button>
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
                    ref={gridRef}
                    itemsSource={cv}
                    isReadOnly={false}
                    autoGenerateColumns={false}
                    style={{ height: '540px' }}
                    selectionMode="Row"
                    headersVisibility="Column"
                    allowSorting={true}
                    >
                        <FlexGridColumn binding="selected" header="선택" width={50} dataType="Boolean" />
                        <FlexGridColumn binding="TABLE_NAME" header="논리 테이블명" width="*" cssClass="blue-column"/>
                        <FlexGridColumn binding="TABLE_ID" header="물리 테이블명" width="*"  />
                        <FlexGridColumn binding="field_count" header="데이터 수" width="0.4*" isReadOnly={true} />
                        <FlexGridColumn binding="VBG_CRE_USER" header="생성자" width="*" isReadOnly={true}  />
                        <FlexGridColumn binding="VBG_CRE_DTM" header="수정일" width="0.5*" align="center" isReadOnly={true}  />
                        <FlexGridColumn binding="TABLE_SEQ" header="SEQ" visible={false} />
                    </FlexGrid>
                </div>
                <span style={{fontSize : '13px', fontWeight : 'bold', marginLeft : '5px'}}> TOTAL : {data.length || 0} </span>    
            </div>;
}

export default Lms;