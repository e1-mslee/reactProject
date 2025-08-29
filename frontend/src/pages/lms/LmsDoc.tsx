import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import { FlexGrid as FlexGridType } from '@mescius/wijmo.grid';
import * as wjGrid from '@mescius/wijmo.grid';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Button, Flex, Modal } from 'antd';
import { useRemoveWijmoLink } from '@hooks/useRemoveWijmoLink';
import { useLmsDocStore } from '@store/lms/lmsDocStore';
import useEvent from 'react-use-event-hook';
import { Height } from '@mui/icons-material';
import { CollectionView } from '@mescius/wijmo';

interface HeaderItem {
  selected: boolean;
  HEADER_ID: string;
  HEADER_NAME: string;
  SUPI_HEADER: string;
  HEADER_WIDTH: number | null;
  CONN_FIELD: string;
  SORT_SN: number | null;
  TABLE_SEQ: string | number;
  deps: HeaderItem[];
  STATUS?: 'ADD' | 'UPD' | 'DEL';
}

const LmsDoc = () => {
  // Wijmo 링크 제거
  useRemoveWijmoLink();

  const params = new URLSearchParams(window.location.search);
  const tableSeq = params.get('tableSeq') || '';
  const gridRef = useRef<{ control: FlexGridType } | null>(null);

  const { treeData, tableData, setParams, fetchHeaderList, fetchTableDataList } = useLmsDocStore();

  const [cv, setCv] = useState<CollectionView<any> | null>(null);

  useEffect(() => {
    setParams(tableSeq);
    void fetchHeaderList();
    void fetchTableDataList();
  }, [fetchTableDataList, fetchHeaderList, setParams, tableSeq]);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const view = new CollectionView<any>(tableData);
      setCv(view);
    } else {
      setCv(null);
    }
  }, [tableData]);

  useEffect(() => {
    const grid = gridRef.current?.control;
    if (!grid || !treeData || treeData.length === 0) return;

    grid.columns.clear();

    const maxDepth = (nodes: HeaderItem[]): number =>
      nodes.length === 0 ? 0 : 1 + Math.max(...nodes.map((n) => maxDepth(n.deps || [])));
    const depth = maxDepth(treeData);

    grid.columnHeaders.rows.clear();
    for (let i = 0; i < depth; i++) {
      grid.columnHeaders.rows.push(new wjGrid.Row());
    }
    console.log('tableData', tableData);
    buildColumns(grid, treeData, 0, { value: 0 }, depth);

    // 병합 허용
    grid.allowMerging = wjGrid.AllowMerging.ColumnHeaders;
    grid.columnHeaders.rows.forEach((r) => (r.allowMerging = true));

    console.log('depth', depth);

    console.log('treeData', treeData);
  }, [treeData]);

  const onPreviewGridInitialized = useEvent((grid: wjGrid.FlexGrid): void => {
    grid.formatItem.addHandler(function (s: wjGrid.FlexGrid, e: wjGrid.FormatItemEventArgs) {
      if (e.panel === s.columnHeaders && e.range.rowSpan > 1) {
        const html = e.cell.innerHTML;
        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
      }
    });
  });

  const buildColumns = (
    grid: wjGrid.FlexGrid,
    nodes: HeaderItem[],
    row: number,
    colIndex: { value: number },
    maxDepth: number
  ) => {
    const panel = grid.columnHeaders;

    nodes.forEach((node) => {
      const hasChildren = node.deps && node.deps.length > 0;
      const col = new wjGrid.Column();
      col.allowMerging = true;
      col.header = node.HEADER_NAME;
      col.width = node.HEADER_WIDTH || 100;
      if (node.HEADER_NAME) {
        col.binding = node.HEADER_NAME;
      }

      // 최하위 노드일 때만 컬럼 추가
      if (!hasChildren) {
        grid.columns.push(col);
        const colIdx = grid.columns.length - 1;

        panel.setCellData(row, colIdx, node.HEADER_NAME);

        for (let r = row + 1; r < maxDepth; r++) {
          panel.setCellData(r, colIdx, node.HEADER_NAME);
        }

        colIndex.value++;
      } else {
        // 그룹 헤더 (자식들이 있으므로 병합 필요)
        const startCol = colIndex.value;
        buildColumns(grid, node.deps, row + 1, colIndex, maxDepth);

        const endCol = colIndex.value - 1;
        // 가로 병합용 텍스트 세팅
        for (let c = startCol; c <= endCol; c++) {
          panel.setCellData(row, c, node.HEADER_NAME);
        }

        if (endCol < startCol) {
          grid.columns.push(col);
          const colIdx = grid.columns.length - 1;
          for (let r = row; r < maxDepth; r++) {
            panel.setCellData(r, colIdx, node.HEADER_NAME);
          }
          colIndex.value++;
        }
      }
    });
  };

  return (
    <div style={{ padding: '10px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>데이터 보기</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 2px 0' }}>
          <Flex gap='small' wrap>
            <Button className='custom-button' onClick={() => console.log('구현중')}>
              엑셀 업로드
            </Button>
            <Button className='custom-button' onClick={() => console.log('구현중')}>
              추가
            </Button>
            <Button className='custom-button' onClick={() => console.log('구현중')}>
              수정
            </Button>
            <Button className='custom-button' onClick={() => console.log('구현중')}>
              삭제
            </Button>
          </Flex>
        </div>
      </div>
      <div className='flexgrid-container' style={{ height: '500px' }}>
        <FlexGrid
          ref={gridRef}
          allowMerging='ColumnHeaders'
          initialized={onPreviewGridInitialized}
          allowSorting={false}
          style={{ height: '100%' }}
          allowDragging='None'
          itemsSource={cv ?? []}
          headersVisibility='Column'
          autoGenerateColumns={false}
          alternatingRowStep={0}
        />
      </div>
    </div>
  );
};

export default LmsDoc;
