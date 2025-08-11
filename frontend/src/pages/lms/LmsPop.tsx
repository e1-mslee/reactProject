import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import { FlexGrid as FlexGridType, CellRangeEventArgs } from '@mescius/wijmo.grid';
import { useEffect, useRef, useCallback } from 'react';
import { Button, Flex, Modal } from 'antd';
import openPop from '@utils/openPop';
import { useLmsPopStore } from '@/store/lms/lmsPopStore';
import { useRemoveWijmoLink } from '@hooks/useRemoveWijmoLink';
// 상수 정의
const CONSTANTS = {
  MESSAGES: {
    CONFIRM_SAVE: '저장하시겠습니까?',
    CONFIRM_DELETE: '삭제 하시겠습니까?',
  },
  GRID_STYLES: {
    height: '400px',
  },
  COLUMN_WIDTHS: {
    SELECT: 60,
    COL_ID: '*',
    COL_NAME: '*',
    COL_TYPE: 100,
    COL_SIZE: 100,
    COL_IDX: 60,
    COL_SCH: 60,
  },
  MODAL_STYLE: { top: 200 },
};

interface GridRow {
  COL_TYPE?: string;
  COL_SIZE?: number | null;
}

const LmsPop = () => {
  // Wijmo 링크 제거
  useRemoveWijmoLink();

  const params = new URLSearchParams(window.location.search);
  const tableSeq = params.get('tableSeq') || '';
  const gridRef = useRef<{ control: FlexGridType } | null>(null);

  const {
    flag,
    readOnlyFlag,
    gridData,
    gridInfo,
    statusMap,
    setGridInfo,
    fetchCommCodes,
    fetchFieldList,
    fetchTableInfo,
    fetchTableCountInfo,
    handleAddRow,
    saveTableInfo,
    deleteData,
  } = useLmsPopStore();

  // 초기 로드
  useEffect(() => {
    void fetchCommCodes();
    if (tableSeq) {
      void fetchTableInfo(tableSeq);
      void fetchFieldList(tableSeq);
      void fetchTableCountInfo(tableSeq);
    }
  }, [fetchCommCodes, fetchTableInfo, fetchFieldList, fetchTableCountInfo, tableSeq]);

  // 헤더 관리 팝업 열기
  const openHeaderManage = useCallback(() => {
    if (!tableSeq) return;
    const tableName = gridInfo.TABLE_NAME;
    const url = `/popup/lms_Header?tableSeq=${encodeURIComponent(tableSeq)}&tableNm=${encodeURIComponent(tableName)}`;
    openPop(url, () => {});
  }, [gridInfo.TABLE_NAME, tableSeq]);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    if (!tableSeq) return;
    Modal.confirm({
      title: '알림',
      content: CONSTANTS.MESSAGES.CONFIRM_SAVE,
      style: CONSTANTS.MODAL_STYLE,
      async onOk() {
        await saveTableInfo(tableSeq);
      },
    });
  }, [saveTableInfo, tableSeq]);

  // 행 추가 핸들러
  const handleAddRowClick = useCallback(() => {
    if (!tableSeq) return;
    handleAddRow(tableSeq);
  }, [handleAddRow, tableSeq]);

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    if (!tableSeq) return;
    Modal.confirm({
      title: '알림',
      content: CONSTANTS.MESSAGES.CONFIRM_DELETE,
      style: CONSTANTS.MODAL_STYLE,
      onOk() {
        deleteData(tableSeq);
      },
    });
  }, [deleteData, tableSeq]);

  return (
    <div style={{ padding: '10px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>필드 속성 정의</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 2px 0' }}>
          <Flex gap='small' wrap>
            <Button className='custom-button' onClick={openHeaderManage}>
              헤더관리
            </Button>
            <Button className='custom-button' onClick={handleSave}>
              저장
            </Button>
          </Flex>
        </div>
      </div>

      <div className='formWrap'>
        <span>논리 테이블 명</span>
        <input
          value={gridInfo.TABLE_NAME || ''}
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb', fontSize: '12px' }}
          placeholder=' 논리 테이블 명을 입력하세요.'
          onChange={(e) => setGridInfo({ ...gridInfo, TABLE_NAME: e.target.value })}
        />
        <span>물리 테이블 명</span>
        <input
          value={gridInfo.TABLE_ID || ''}
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb', fontSize: '12px' }}
          placeholder=' 물리 테이블 명을 입력하세요.'
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
        <div className='buttonGroup'>
          <Flex gap='small' wrap>
            <Button className='custom-button' onClick={handleAddRowClick} disabled={readOnlyFlag}>
              행추가
            </Button>
            <Button className='custom-button' onClick={handleDelete} disabled={readOnlyFlag}>
              행삭제
            </Button>
          </Flex>
        </div>
      </div>

      <div style={{ margin: '2px' }}>
        <FlexGrid
          ref={gridRef}
          itemsSource={gridData || []}
          isReadOnly={readOnlyFlag}
          autoGenerateColumns={false}
          style={CONSTANTS.GRID_STYLES}
          selectionMode='Row'
          headersVisibility='Column'
          allowSorting={true}
          initialized={(grid: FlexGridType) => {
            grid.beginningEdit.addHandler((s: FlexGridType, e: CellRangeEventArgs) => {
              const col = s.columns[e.col];
              const item = s.rows[e.row]?.dataItem as GridRow | undefined;

              if (col?.binding === 'COL_SIZE' && item) {
                const colType = item.COL_TYPE;
                if (colType !== '2' && colType !== '1') {
                  e.cancel = true;
                }
              }
            });

            grid.cellEditEnded.addHandler((s: FlexGridType, e: CellRangeEventArgs) => {
              const col = s.columns[e.col];
              const item = s.rows[e.row]?.dataItem as GridRow | undefined;

              if (col?.binding === 'COL_TYPE' && item) {
                if (item.COL_TYPE === '3') {
                  item.COL_SIZE = 700;
                  //s.invalidate(); // 그리드 리프레시 (필요시)
                } else if (item.COL_TYPE === '4') {
                  item.COL_SIZE = 10;
                } else if (item.COL_TYPE === '5') {
                  item.COL_SIZE = 20;
                } else if (item.COL_TYPE === '6') {
                  item.COL_SIZE = 1;
                } else {
                  item.COL_SIZE = null;
                }
                s.invalidate();
              }
            });
          }}
        >
          <FlexGridColumn binding='selected' header='선택' width={CONSTANTS.COLUMN_WIDTHS.SELECT} dataType='Boolean' />
          <FlexGridColumn binding='COL_ID' header='컬럼 ID' width={CONSTANTS.COLUMN_WIDTHS.COL_ID} isReadOnly={true} />
          <FlexGridColumn binding='COL_NAME' header='컬럼명' width={CONSTANTS.COLUMN_WIDTHS.COL_NAME} />
          <FlexGridColumn
            binding='COL_TYPE'
            header='유형'
            width={CONSTANTS.COLUMN_WIDTHS.COL_TYPE}
            dataMap={statusMap}
          />
          <FlexGridColumn binding='COL_SIZE' header='길이' width={CONSTANTS.COLUMN_WIDTHS.COL_SIZE} />
          <FlexGridColumn binding='COL_IDX' header='필수' width={CONSTANTS.COLUMN_WIDTHS.COL_IDX} dataType='Boolean' />
          <FlexGridColumn binding='COL_SCH' header='검색' width={CONSTANTS.COLUMN_WIDTHS.COL_SCH} dataType='Boolean' />
          <FlexGridColumn binding='TABLE_SEQ' header='SEQ' visible={false} />
        </FlexGrid>
      </div>
    </div>
  );
};

export default LmsPop;
