import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import api from './../api/api.js';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import { DataMap } from '@mescius/wijmo.grid';
import { CollectionView } from '@mescius/wijmo';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Flex, Modal, message } from 'antd';
import openPop from '@utils/openPop.js';

const LmsPop = () => {
  const params = new URLSearchParams(window.location.search);
  const tableSeq = params.get('tableSeq');
  const gridRef = useRef(null);
  const [flag, setFlag] = useState(false);
  const [initialGridInfo, setInitialGridInfo] = useState(null);
  const [gridData, setGridData] = useState([]);
  const [commCodes, setCommCodes] = useState([]);
  const [gridInfo, setGridInfo] = useState({
    TABLE_NAME: '',
    TABLE_ID: '',
    TABLE_SEQ: '',
  });
  const statusMap = new DataMap(commCodes, 'COM_CD', 'COM_CD_NM');

  const fetchCommCodes = async () => {
    try {
      const res = await api.get('/api/commCode');
      setCommCodes(res.data);
    } catch (err) {
      console.error('공통코드 불러오기 오류:', err);
    }
  };

  const openHeaderManage = () => {
    const tableName = gridInfo.TABLE_NAME;
    const url = `/popup/lms_Header?tableSeq=${encodeURIComponent(tableSeq)}&tableNm=${encodeURIComponent(tableName)}`;
    openPop(url);
  };

  const fetchFieldList = useCallback(async () => {
    try {
      const res = await api.post('/api/getTableFieldList', String(tableSeq));
      setGridData(new CollectionView(res.data, { trackChanges: true }));
    } catch (err) {
      console.error('필드 목록 불러오기 오류:', err);
    }
  }, [tableSeq]);

  const fetchTableInfo = useCallback(async () => {
    try {
      const res = await api.post('/api/getMainTableInfoData', String(tableSeq));
      const info = res.data[0] || {};
      setGridInfo(info);
      setInitialGridInfo(info);
      setFlag(!!info.TABLE_ID);
    } catch (err) {
      console.error('테이블 정보 불러오기 오류:', err);
    }
  }, [tableSeq]);

  useEffect(() => {
    const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');
    if (link) {
      link.remove();
    }

    fetchCommCodes();
    fetchTableInfo();
    fetchFieldList();
  }, [fetchTableInfo, fetchFieldList]);

  const saveTableInfo = () => {
    if (!gridInfo) return;

    if (!flag) {
      Modal.confirm({
        title: '알림',
        content: '저장하시겠습니까?',
        style: { top: 200 },
        async onOk() {
          try {
            await api.post('/api/saveMainTableInfo', [gridInfo]);
            message.success('저장되었습니다.');
            await fetchTableInfo();
            await fetchFieldList();

            if (window.opener && typeof window.opener.handlePopChange === 'function') {
              window.opener.handlePopChange();
            }
          } catch (error) {
            console.error('저장 오류:', error);
            message.error('저장 중 오류가 발생했습니다.');
          }
        },
      });
    } else {
      if (!gridData) return;

      const addedItems = (gridData.itemsAdded || []).map((item) => ({
        ...item,
        STATUS: 'INS',
      }));
      const editedItems = (gridData.itemsEdited || []).map((item) => ({
        ...item,
        STATUS: 'UPD',
      }));

      const newItems = [...addedItems, ...editedItems];

      console.log('newItems', newItems);

      if (newItems.length === 0 && initialGridInfo.TABLE_NAME == gridInfo.TABLE_NAME) {
        message.error('저장할 내용이 없습니다.');
        return;
      }

      for (const item of newItems) {
        if (!item.COL_NAME) {
          message.error('컬럼명은 필수 입력 항목입니다.');
          return;
        }

        if (!item.COL_TYPE) {
          message.error('컬럼 타입은 필수 입력 항목입니다.');
          return;
        }

        if (!item.COL_SIZE && item.COL_TYPE == 2) {
          message.error('컬럼 길이는 필수 입력 항목입니다.');
          return;
        }
      }

      Modal.confirm({
        title: '알림',
        content: '저장하시겠습니까?',
        style: { top: 200 },
        async onOk() {
          try {
            await api.post('/api/saveTableFieldList', newItems);
            await api.post('/api/saveMainTableInfo', [gridInfo]);
            message.success('저장되었습니다.');
            await fetchTableInfo();
            await fetchFieldList();

            if (window.opener && typeof window.opener.handlePopChange === 'function') {
              window.opener.handlePopChange();
            }
          } catch (error) {
            console.error('저장 오류:', error);
            message.error('저장 중 오류가 발생했습니다.');
          }
        },
      });
    }
  };

  const handleAddRow = () => {
    if (!gridData) return;
    console.log(flag);
    if (!flag) {
      message.error('물리 테이블명 저장 후 추가 가능합니다.');
      return;
    }

    const maxSeq = gridData.items
      .map((item) => {
        const match = item.COL_ID?.match(/^COL_(\d{3})$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .reduce((max, curr) => Math.max(max, curr), 0);

    const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
    const nextColId = `COL_${nextSeq}`;

    const newRow = {
      selected: false,
      COL_ID: nextColId,
      COL_NM: '',
      COL_TYPE: '',
      COL_SIZE: null,
      COL_IDX: false,
      COL_SCH: false,
      TABLE_SEQ: tableSeq,
    };

    const newItem = gridData.addNew();
    Object.assign(newItem, newRow);
    gridData.commitNew();
  };

  const deleteData = async () => {
    if (!gridData) return;
    const selected = gridData.items.filter((row) => row.selected);

    if (selected.length === 0) {
      message.error('선택된 행이 없습니다.');
      return;
    }

    const deleteList = selected
      .filter((row) => row.COL_ID)
      .map((row) => ({
        COL_ID: row.COL_ID,
        TABLE_SEQ: row.TABLE_SEQ,
      }));

    if (deleteList.length === 0) {
      const filtered = gridData.items.filter((row) => !row.selected || row.COL_ID);
      setGridData(new CollectionView(filtered, { trackChanges: true }));
      return;
    }

    console.log('deleteRow', deleteList);
    Modal.confirm({
      title: '알림',
      content: '삭제 하시겠습니까?',
      style: { top: 200 },
      async onOk() {
        try {
          await api.post('/api/deleteTableField', deleteList);
          message.success('삭제되었습니다');
          fetchFieldList();
        } catch (err) {
          console.error('삭제 오류:', err);
          message.error('삭제 중 오류 발생');
        }
      },
    });
  };

  return (
    <div style={{ padding: '10px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>필드 속성 정의</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 2px 0' }}>
          <Flex gap="small" wrap>
            <Button className="custom-button" onClick={openHeaderManage}>
              헤더관리
            </Button>
            <Button className="custom-button" onClick={saveTableInfo}>
              저장
            </Button>
          </Flex>
        </div>
      </div>
      <div className="formWrap">
        <span>논리 테이블 명</span>
        <input
          value={gridInfo.TABLE_NAME || ''}
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb', fontSize: '12px' }}
          placeholder=" 논리 테이블 명을 입력하세요."
          onChange={(e) => setGridInfo({ ...gridInfo, TABLE_NAME: e.target.value })}
        />
        <span>물리 테이블 명</span>
        <input
          value={gridInfo.TABLE_ID || ''}
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb', fontSize: '12px' }}
          placeholder=" 물리 테이블 명을 입력하세요."
          onChange={(e) => setGridInfo({ ...gridInfo, TABLE_ID: e.target.value })}
          disabled={flag}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h4
          style={{ fontSize: '14px', fontWeight: '700', color: '#002c5f', letterSpacing: '-0.7px', marginRight: '8px' }}
        >
          <i
            style={{
              width: '10px',
              height: '10px',
              border: '3px solid #102f5b',
              display: 'inline-block',
              marginRight: '8px',
            }}
          ></i>
          열 속성 목록
        </h4>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 4px 0' }}>
          <Flex gap="small" wrap>
            <Button className="custom-button" onClick={handleAddRow}>
              행추가
            </Button>
            <Button className="custom-button" onClick={deleteData}>
              행삭제
            </Button>
          </Flex>
        </div>
      </div>
      <div style={{ margin: '2px' }}>
        <FlexGrid
          ref={gridRef}
          itemsSource={gridData}
          isReadOnly={false}
          autoGenerateColumns={false}
          style={{ height: '400px' }}
          selectionMode="Row"
          headersVisibility="Column"
          allowSorting={true}
          initialized={(grid) => {
            grid.beginningEdit.addHandler((s, e) => {
              const col = s.columns[e.col];
              const item = s.rows[e.row].dataItem;
              console.log('item.COL_TYPE', item.COL_TYPE);
              if (col.binding === 'COL_SIZE' && item.COL_TYPE !== '2' && item.COL_TYPE !== '1') {
                e.cancel = true;
              }
            });

            grid.cellEditEnded.addHandler((s, e) => {
              const col = s.columns[e.col];
              const item = s.rows[e.row].dataItem;

              if (col.binding === 'COL_TYPE') {
                item.COL_SIZE = null;
                s.invalidate(); // 그리드 리렌더링
              }
            });
          }}
        >
          <FlexGridColumn binding="selected" header="선택" width={60} dataType="Boolean" />
          <FlexGridColumn binding="COL_ID" header="컬럼 ID" width="*" isReadOnly={true} />
          <FlexGridColumn binding="COL_NAME" header="컬럼명" width="*" />
          <FlexGridColumn binding="COL_TYPE" header="유형" width={100} dataMap={statusMap} />
          <FlexGridColumn binding="COL_SIZE" header="길이" width={100} />
          <FlexGridColumn binding="COL_IDX" header="필수" width={60} dataType="Boolean" />
          <FlexGridColumn binding="COL_SCH" header="검색" width={60} dataType="Boolean" />
          <FlexGridColumn binding="TABLE_SEQ" header="SEQ" visible={false} />
        </FlexGrid>
      </div>
    </div>
  );
};

export default LmsPop;
