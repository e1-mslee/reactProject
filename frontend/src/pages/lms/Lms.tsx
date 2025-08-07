import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FlexGrid, FlexGridColumn, FlexGridCellTemplate } from '@mescius/wijmo.react.grid';
import * as wjcGridXlsx from '@mescius/wijmo.grid.xlsx';
import { FlexGrid as FlexGridType } from '@mescius/wijmo.grid';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, Flex, Modal, message } from 'antd';
import openPop from '@utils/openPop';
import { useLmsStore } from '@store/lmsStore';
import { useRemoveWijmoLink } from '@hooks/useRemoveWijmoLink';

// 상수 정의
const CONSTANTS = {
  MESSAGES: {
    SELECT_ONE_ITEM: '1개의 항목을 선택하세요.',
    SELECT_ITEM: '수정할 항목을 선택하세요.',
    CONFIRM_SAVE: '저장하시겠습니까?',
    CONFIRM_DELETE: '삭제 하시겠습니까?',
  },
  GRID_STYLES: {
    height: '540px',
  },
  COLUMN_WIDTHS: {
    SELECT: 50,
    TABLE_NAME: '*',
    TABLE_ID: '*',
    FIELD_COUNT: '0.4*',
    CREATOR: '*',
    CREATED_DATE: '0.5*',
  },
  MODAL_STYLE: { top: 200 },
};

interface TableInfo {
  TABLE_SEQ: string;
  TABLE_NAME: string;
  TABLE_ID: string;
  field_count: string;
  VBG_CRE_USER: string;
  VBG_CRE_DTM: string;
  selected?: boolean;
}

interface CellContext {
  item: TableInfo;
}

const Lms = () => {
  // Wijmo 링크 제거
  useRemoveWijmoLink();

  // 날짜 상태 관리
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  // Zustand 스토어 사용
  const { data, cv, fetchGridData, handleAddRow, saveTable, deleteData } = useLmsStore();

  const gridRef = useRef<{ control: FlexGridType } | null>(null);

  // 초기 로드
  useEffect(() => {
    void fetchGridData(startDate, endDate);
  }, [fetchGridData, startDate, endDate]);

  // 팝업 열기 함수 메모이제이션
  const openPopupWithRefresh = useCallback(
    (tableSeq: string) => {
      if (!tableSeq) return;
      const url = `/popup/lms_pop?tableSeq=${encodeURIComponent(tableSeq)}`;
      openPop(url, () => void fetchGridData(startDate, endDate));
    },
    [fetchGridData, startDate, endDate]
  );

  // 테이블 수정
  const modifyTableColumn = useCallback(() => {
    if (!cv) return;

    const selectedRows = cv.items.filter((row) => row.selected);

    if (selectedRows.length === 0) {
      message.info(CONSTANTS.MESSAGES.SELECT_ITEM);
      return;
    } else if (selectedRows.length > 1) {
      message.info(CONSTANTS.MESSAGES.SELECT_ONE_ITEM);
      return;
    }

    const tableSeq = selectedRows[0]?.TABLE_SEQ;
    if (tableSeq) {
      openPopupWithRefresh(tableSeq);
    }
  }, [cv, openPopupWithRefresh]);

  // 테이블명 클릭 핸들러
  const handleTableNameClick = useCallback(
    (tableSeq: string) => {
      openPopupWithRefresh(tableSeq);
    },
    [openPopupWithRefresh]
  );

  // 모달 확인 함수 메모이제이션
  const createConfirmModal = useCallback((content: string, onOk: () => Promise<void>) => {
    return Modal.confirm({
      title: '알림',
      content,
      style: CONSTANTS.MODAL_STYLE,
      onOk: async () => {
        await onOk();
      },
    });
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    createConfirmModal(CONSTANTS.MESSAGES.CONFIRM_SAVE, async () => {
      await saveTable(startDate, endDate);
    });
  }, [createConfirmModal, saveTable, startDate, endDate]);

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    createConfirmModal(CONSTANTS.MESSAGES.CONFIRM_DELETE, async () => {
      await deleteData(startDate, endDate);
    });
  }, [createConfirmModal, deleteData, startDate, endDate]);

  // 조회 핸들러
  const handleSearch = useCallback(() => {
    void fetchGridData(startDate, endDate);
  }, [fetchGridData, startDate, endDate]);

  // 엑셀 내보내기
  const exportToExcel = useCallback(() => {
    if (!gridRef.current) return;

    wjcGridXlsx.FlexGridXlsxConverter.saveAsync(
      gridRef.current.control,
      {
        includeStyles: true,
      },
      'UDA 목록.xlsx'
    );
  }, []);

  // 버튼 핸들러들 메모이제이션
  const buttonHandlers = useMemo(
    () => ({
      onSearch: handleSearch,
      onAdd: handleAddRow,
      onModify: modifyTableColumn,
      onSave: handleSave,
      onDelete: handleDelete,
      onExport: exportToExcel,
    }),
    [handleSearch, handleAddRow, modifyTableColumn, handleSave, handleDelete, exportToExcel]
  );

  // 그리드 템플릿 메모이제이션
  const tableNameTemplate = useCallback(
    (ctx: CellContext) => (
      <span
        onClick={() => handleTableNameClick(ctx.item.TABLE_SEQ)}
        style={{ cursor: ctx.item.TABLE_SEQ ? 'pointer' : 'default' }}
      >
        {ctx.item.TABLE_NAME}
      </span>
    ),
    [handleTableNameClick]
  );

  return (
    <div>
      <span style={{ fontSize: '22px', fontWeight: 'bold' }}>UDA 목록</span>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 10px 0' }}>
        <Flex gap='small' wrap>
          <Button className='custom-button' onClick={buttonHandlers.onSearch}>
            조회
          </Button>
          <Button className='custom-button' onClick={buttonHandlers.onAdd}>
            추가
          </Button>
          <Button className='custom-button' onClick={buttonHandlers.onModify}>
            수정
          </Button>
          <Button className='custom-button' onClick={buttonHandlers.onSave}>
            저장
          </Button>
          <Button className='custom-button' onClick={buttonHandlers.onDelete}>
            삭제
          </Button>
          <Button className='custom-button' onClick={buttonHandlers.onExport}>
            엑셀
          </Button>
        </Flex>
      </div>

      {/* 검색 조건 */}
      <div className='formWrap'>
        <span>검색조건</span>
        <input
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb' }}
          placeholder='검색조건을 입력하세요.'
        />
        <span>수정일</span>
        <DatePicker
          dateFormat='yyyy-MM-dd'
          className='datepicker'
          shouldCloseOnSelect
          selected={startDate}
          onChange={(date: Date | null) => date && setStartDate(date)}
        />
        <span style={{ width: '10px' }}>~</span>
        <DatePicker
          dateFormat='yyyy-MM-dd'
          className='datepicker'
          shouldCloseOnSelect
          selected={endDate}
          onChange={(date: Date | null) => date && setEndDate(date)}
        />
      </div>

      {/* 그리드 */}
      <div style={{ margin: '2px' }}>
        <FlexGrid
          ref={gridRef}
          itemsSource={cv ? cv : []}
          isReadOnly={false}
          autoGenerateColumns={false}
          style={CONSTANTS.GRID_STYLES}
          selectionMode='Row'
          headersVisibility='Column'
          allowSorting={true}
        >
          <FlexGridColumn binding='selected' header='선택' width={CONSTANTS.COLUMN_WIDTHS.SELECT} dataType='Boolean' />
          <FlexGridColumn
            binding='TABLE_NAME'
            header='논리 테이블명'
            width={CONSTANTS.COLUMN_WIDTHS.TABLE_NAME}
            cssClass='blue-column'
          >
            <FlexGridCellTemplate cellType='Cell' template={tableNameTemplate} />
          </FlexGridColumn>
          <FlexGridColumn binding='TABLE_ID' header='물리 테이블명' width={CONSTANTS.COLUMN_WIDTHS.TABLE_ID} />
          <FlexGridColumn
            binding='field_count'
            header='데이터 수'
            width={CONSTANTS.COLUMN_WIDTHS.FIELD_COUNT}
            isReadOnly={true}
          />
          <FlexGridColumn
            binding='VBG_CRE_USER'
            header='생성자'
            width={CONSTANTS.COLUMN_WIDTHS.CREATOR}
            isReadOnly={true}
          />
          <FlexGridColumn
            binding='VBG_CRE_DTM'
            header='수정일'
            width={CONSTANTS.COLUMN_WIDTHS.CREATED_DATE}
            align='center'
            isReadOnly={true}
          />
          <FlexGridColumn binding='TABLE_SEQ' header='SEQ' visible={false} />
        </FlexGrid>
      </div>

      {/* 총 개수 표시 */}
      <span style={{ fontSize: '13px', fontWeight: 'bold', marginLeft: '5px' }}>TOTAL : {data.length || 0}</span>
    </div>
  );
};

export default Lms;
