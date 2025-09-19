import '@mescius/wijmo.styles/wijmo.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import * as wjGrid from '@mescius/wijmo.grid';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import { useRef } from 'react';
import { useRemoveWijmoLink } from '@hooks/useRemoveWijmoLink';
import { CollectionView, isEmpty } from '@mescius/wijmo';
import { SampleData } from './data';

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
    FIELD_COUNT: '0.3*',
    CREATOR: '0.4*',
    CREATED_DATE: '0.4*',
  },
  MODAL_STYLE: { top: 200 },
};

class CustomMergeManager extends wjGrid.MergeManager {
  getMergedRange(panel: wjGrid.GridPanel, r: number, c: number, clip = true) {
    const rng = new wjGrid.CellRange(r, c);
    if (panel.cellType !== wjGrid.CellType.Cell) return rng;

    // rowspan
    for (let i = rng.row; i < panel.rows.length - 1; i++) {
      if (panel.getCellData(i, rng.col, false) != panel.getCellData(i + 1, rng.col, false)) break;
      rng.row2 = i + 1;
    }
    for (let i = rng.row; i > 0; i--) {
      if (panel.getCellData(i, rng.col, false) != panel.getCellData(i - 1, rng.col, false)) break;
      rng.row = i - 1;
    }

    if (r !== rng.row) {
      return rng; // already row span cell col-span skip
    }

    // col span
    for (let i = rng.col; i < panel.columns.length - 1; i++) {
      if (panel.getCellData(rng.row, i, false) != panel.getCellData(rng.row, i + 1, false)) {
        break;
      }
      rng.col2 = i + 1;
    }
    for (let i = rng.col; i > 0; i--) {
      if (panel.getCellData(rng.row, i, false) != panel.getCellData(rng.row, i - 1, false)) break;
      rng.col = i - 1;
    }

    return rng;
  }
}

const MergedCells = () => {
  // Wijmo 링크 제거
  useRemoveWijmoLink();

  const gridRef = useRef<wjGrid.FlexGrid | null>(null);

  const cv = new CollectionView(SampleData);

  const flexInitialized = (grid: wjGrid.FlexGrid) => {
    gridRef.current = grid;

    // 전체 병합 허용 + 커스텀 MergeManager 장착
    grid.allowMerging = wjGrid.AllowMerging.Cells;
    grid.mergeManager = new CustomMergeManager(grid);

    grid.columns.getColumn('deptName').allowMerging = true;
    grid.columns.getColumn('location').allowMerging = true;

    grid.columns.getColumn('active').allowMerging = true;
    grid.columns.getColumn('active2').allowMerging = true;

    grid.itemFormatter = (panel, r, c, cell) => {
      if (panel.cellType !== wjGrid.CellType.Cell) return;
      const b = (panel.columns[c] as wjGrid.Column).binding as string;
      if (['deptName', 'empName', 'record', 'location', 'active', 'active2'].includes(b)) {
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.whiteSpace = 'normal';
        cell.style.lineHeight = '1.3';
      }
    };
  };

  return (
    <div>
      <span style={{ fontSize: '22px', fontWeight: 'bold' }}>Multi Rows/Columns Sample</span>

      {/* 그리드 */}
      <div style={{ margin: '15px 2px' }}>
        <FlexGrid
          ref={gridRef}
          itemsSource={cv || []}
          initialized={flexInitialized}
          isReadOnly={false}
          autoGenerateColumns={false}
          style={CONSTANTS.GRID_STYLES}
          selectionMode='Row'
          headersVisibility='Column'
          allowSorting={true}
          allowMerging='Cells'
        >
          <FlexGridColumn binding='deptName' header='팀명' width='0.5*' align='center' allowMerging={true} />
          <FlexGridColumn binding='empName' header='직원명' width='0.5*' align='center' />
          <FlexGridColumn
            binding='location'
            header='지역'
            width='0.3*'
            align='center'
            isReadOnly={true}
            allowMerging={true}
          />
          <FlexGridColumn binding='record' header='기록' width='0.4*' isReadOnly={true} />
          <FlexGridColumn
            binding='active'
            header='active'
            dataType='Boolean'
            width={CONSTANTS.COLUMN_WIDTHS.CREATOR}
            allowMerging={true}
            isReadOnly={true}
          />
          <FlexGridColumn
            binding='active2'
            header='active2'
            dataType='Boolean'
            width={CONSTANTS.COLUMN_WIDTHS.CREATOR}
            allowMerging={true}
            isReadOnly={true}
          />
          <FlexGridColumn
            binding='button'
            header='바로가기'
            width='0.4*'
            align='center'
            isReadOnly={true}
            cssClass='blue-column'
          />
        </FlexGrid>
      </div>

      {/* 총 개수 표시 */}
      <span className='totalCount'>TOTAL : {SampleData.length || 0}</span>
    </div>
  );
};

export default MergedCells;
