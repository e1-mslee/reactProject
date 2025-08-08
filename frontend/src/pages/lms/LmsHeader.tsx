import React from 'react';
import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import { useLmsHeaderStore } from '@store/lmsHeaderStore';
import type { HeaderItem } from '@api/lmsHeaderApi';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import { FlexGrid as FlexGridType, CellRangeEventArgs } from '@mescius/wijmo.grid';
import { DataMap, CellType } from '@mescius/wijmo.grid';
import { CollectionView } from '@mescius/wijmo';
import { useEffect, useRef } from 'react';
import useEvent from 'react-use-event-hook';
import { Button, Flex, message } from 'antd';
import * as wjGrid from '@mescius/wijmo.grid';
import { useRemoveWijmoLink } from '@hooks/useRemoveWijmoLink';

// 미리보기 렌더링용 트리 타입
interface HeaderTreeItem extends Omit<HeaderItem, 'deps'> {
  children: HeaderTreeItem[];
}

// Wijmo CollectionView는 런타임에 변경 추적 배열을 노출하므로 타입 보강이 필요하다
type TrackableCollectionView<T> = CollectionView<T> & {
  itemsAdded: T[];
  itemsEdited: T[];
  itemsRemoved: T[];
  sourceCollection: T[];
};

const LmsHeader: React.FC = () => {
  // Wijmo 링크 제거
  useRemoveWijmoLink();

  const params = new URLSearchParams(window.location.search);
  const tableSeq = params.get('tableSeq');
  const tableNm = params.get('tableNm');

  const gridRef = useRef<{ control: FlexGridType } | null>(null);
  const previewGridRef = useRef<{ control: FlexGridType } | null>(null);
  const {
    gridData,
    supiHeaderMap,
    statusMap,
    headerConfig,
    isCollapsedAll,
    reviewFlag,
    showExportButton,
    setParams,
    fetchHeaderList,
    fetchTableFields,
    toggleCollapse,
    toggleReview,
    addRow,
    deleteRows: deleteRowsInStore,
    save,
    exportFields,
    buildTreeForPreview,
  } = useLmsHeaderStore();

  const findSelectedItems = (items: HeaderItem[]): HeaderItem[] => {
    let result: HeaderItem[] = [];

    items.forEach((item) => {
      if (item.selected) {
        result.push(item);
      }
      if (item.deps && item.deps.length > 0) {
        result = result.concat(findSelectedItems(item.deps));
      }
    });

    return result;
  };

  function findParent(items: HeaderItem[], targetItem: HeaderItem): HeaderItem | null {
    for (const item of items) {
      if (item.deps && item.deps.includes(targetItem)) {
        return item;
      }
      if (item.deps && item.deps.length > 0) {
        const parent = findParent(item.deps, targetItem);
        if (parent) return parent;
      }
    }
    return null;
  }

  const deleteRows = (): void => {
    const grid = gridRef.current?.control;
    if (!grid) return;

    const allItems = grid.collectionView.items as HeaderItem[];
    const selectedItems = findSelectedItems(allItems);

    if (selectedItems.length === 0) {
      message.warning('삭제할 행을 선택하세요.');
      return;
    }

    deleteRowsInStore(selectedItems);
  };

  const toggleTreeCollapse = (): void => {
    const grid = gridRef.current?.control;
    if (!grid) return;

    const nextCollapsed = !isCollapsedAll;
    grid.rows.forEach((row: wjGrid.Row) => {
      const tRow = row as unknown as { hasChildren?: boolean; isCollapsed?: boolean };
      if (tRow.hasChildren) {
        tRow.isCollapsed = nextCollapsed;
      }
    });

    toggleCollapse();
  };

  useEffect(() => {
    setParams(tableSeq, tableNm);
    void fetchHeaderList();
    void fetchTableFields();
  }, [fetchHeaderList, fetchTableFields, setParams, tableSeq, tableNm]);

  const onLoadedRows = (s: wjGrid.FlexGrid): void => {
    for (let i = 0; i < s.rows.length; i++) {
      (s.rows[i] as unknown as { isReadOnly?: boolean }).isReadOnly = false;
    }
  };

  const formatItem = (s: wjGrid.FlexGrid, e: wjGrid.FormatItemEventArgs): void => {
    if (e.panel.cellType !== CellType.Cell) return;

    const col = s.columns[e.col]!;
    const row = s.rows[e.row] as unknown as {
      level?: number;
      hasChildren?: boolean;
      isCollapsed?: boolean;
      dataItem?: HeaderItem;
    };

    if (col.index === 0) {
      e.cell.innerHTML = '';
      e.cell.style.paddingLeft = '';
      return;
    }

    if (s.editRange && s.editRange.row === e.row && s.editRange.col === e.col) {
      return;
    }

    if (col && col.binding === 'HEADER_NAME') {
      const padding = (row?.level ?? 0) * 18;
      const headerName: string = row?.dataItem?.HEADER_NAME ?? '';

      if (row?.hasChildren) {
        const iconClass = row.isCollapsed ? 'wj-glyph-right' : 'wj-glyph-down-right';

        e.cell.innerHTML = `
        <div style="display: flex; align-items: center; padding-left: ${padding}px;">
          <button class="wj-btn wj-btn-glyph wj-elem-collapse" tabindex="-1" aria-label="Toggle Group">
            <span class="${iconClass}"></span>
          </button>
          <span style="margin-left: 4px;">${headerName}</span>
        </div>
      `;

        const button = e.cell.querySelector('button');
        if (button) {
          button.onclick = (evt: Event) => {
            row.isCollapsed = !row.isCollapsed;
            s.invalidate();
            evt.stopPropagation();
          };
        }
      } else {
        e.cell.innerHTML = `<div style=\"padding-left: ${padding + 20}px;\">${headerName}</div>`;
      }
    }
  };

  const onBeginningEdit = useEvent((flexGrid: wjGrid.FlexGrid, e: wjGrid.CellRangeEventArgs): void => {
    const row = flexGrid.rows[e.row];
    const item = (row?.dataItem as HeaderItem) || undefined;
    const binding = (flexGrid.columns[e.col]?.binding as string) || null;
    if (!item || !binding || !(binding in item) || binding === 'HEADER_ID') {
      e.cancel = true;
    }
  });

  function markAsEdited(grid: wjGrid.FlexGrid, item: HeaderItem): void {
    const view = grid.collectionView as unknown as TrackableCollectionView<HeaderItem>;
    const existingItem = view.itemsEdited.find((_item: HeaderItem) => _item === item);
    if (!existingItem) {
      view.itemsEdited.push(item);
    }
  }

  const getNextHeaderId = (): string => {
    if (!gridData || !gridData.items) return 'HEAD_001';

    let max = 0;

    const walk = (items: HeaderItem[]): void => {
      items.forEach((item: HeaderItem) => {
        const match = /^HEAD_(\d+)$/.exec(item.HEADER_ID);
        if (match) {
          const num = parseInt(match[1] as string, 10);
          if (num > max) max = num;
        }
        if (Array.isArray(item.deps)) {
          walk(item.deps);
        }
      });
    };

    const itemsForWalk = gridData.items.filter(
      (it): it is HeaderItem => typeof (it as HeaderItem).HEADER_ID === 'string'
    );
    walk(itemsForWalk);

    const nextNum = max + 1;
    return `HEAD_${String(nextNum).padStart(3, '0')}`;
  };

  const onPreviewGridInitialized = useEvent((grid: wjGrid.FlexGrid): void => {
    grid.formatItem.addHandler(function (s: wjGrid.FlexGrid, e: wjGrid.FormatItemEventArgs) {
      if (e.panel === s.columnHeaders && e.range.rowSpan > 1) {
        const html = e.cell.innerHTML;
        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
      }
    });
  });

  const buildTree2 = (flatList: HeaderItem[]): HeaderTreeItem[] => {
    const map: { [key: string]: HeaderTreeItem } = {};
    const roots: HeaderTreeItem[] = [];

    flatList.forEach((item) => {
      item.selected = Boolean(item.selected);
      map[item.HEADER_ID] = { ...item, children: [] };
    });

    flatList.forEach((item) => {
      const currentItem = map[item.HEADER_ID];
      if (!currentItem) {
        return;
      }
      const parent = item.SUPI_HEADER ? map[item.SUPI_HEADER] : undefined;
      if (parent) {
        parent.children.push(currentItem);
      } else {
        roots.push(currentItem);
      }
    });
    return roots;
  };

  useEffect(() => {
    const grid = previewGridRef.current?.control;
    if (!grid || !headerConfig || headerConfig.length === 0) {
      return;
    }

    const treeHeaders = buildTreeForPreview(headerConfig) as unknown as HeaderTreeItem[];

    const allLeafNodes: HeaderTreeItem[] = [];
    const collectAllLeafNodes = (nodes: HeaderTreeItem[]): void => {
      nodes.forEach((node: HeaderTreeItem) => {
        if (node.children.length === 0) {
          allLeafNodes.push(node);
        } else {
          collectAllLeafNodes(node.children);
        }
      });
    };
    collectAllLeafNodes(treeHeaders);

    allLeafNodes.sort((a, b) => (a.SORT_SN || 0) - (b.SORT_SN || 0));

    grid.columns.clear();
    const panel = grid.columnHeaders;
    while (panel.rows.length > 0) {
      panel.rows.removeAt(0);
    }

    let maxDepth = 0;
    const calculateDepth = (nodes: HeaderTreeItem[], currentDepth: number): void => {
      if (nodes.length === 0) {
        if (currentDepth > maxDepth) {
          maxDepth = currentDepth;
        }
        return;
      }
      nodes.forEach((node) => {
        calculateDepth(node.children, currentDepth + 1);
      });
    };
    calculateDepth(treeHeaders, 0);

    if (maxDepth === 0 && allLeafNodes.length > 0) {
      maxDepth = 1;
    } else if (maxDepth === 0 && allLeafNodes.length === 0) {
      grid.invalidate();
      return;
    }

    for (let i = 0; i < maxDepth; i++) {
      const extraRow = new wjGrid.Row();
      extraRow.allowMerging = true;
      panel.rows.push(extraRow);
    }

    if (allLeafNodes.length === 0) {
      grid.invalidate();
      return;
    }

    const leafNodeBindingMap = new Map<string, string>();
    allLeafNodes.forEach((node, index) => {
      const connField = (node.CONN_FIELD ?? '').trim();
      const binding = connField !== '' ? connField : `__dummy_col_${node.HEADER_ID}_${index}`;
      leafNodeBindingMap.set(node.HEADER_ID, binding);

      const col = new wjGrid.Column({
        binding: binding,
        header: node.HEADER_NAME,
        width: node.HEADER_WIDTH && node.HEADER_WIDTH > 0 ? node.HEADER_WIDTH : '*',
        isReadOnly: true,
        allowMerging: true,
      });
      grid.columns.push(col);
    });

    const getColumnSpan = (node: HeaderTreeItem): { start: number; end: number } => {
      const coveredLeafBindings: string[] = [];
      const getCoveredLeaves = (n: HeaderTreeItem): void => {
        if (n.children && n.children.length > 0) {
          n.children.forEach((child) => getCoveredLeaves(child));
        } else {
          const binding = leafNodeBindingMap.get(n.HEADER_ID);
          if (binding) {
            coveredLeafBindings.push(binding);
          }
        }
      };
      getCoveredLeaves(node);

      const validBindings = coveredLeafBindings.filter((b) => b);

      if (validBindings.length === 0) {
        return { start: -1, end: -1 };
      }

      const indices = validBindings
        .map((binding) => grid.columns.findIndex((col) => col.binding === binding))
        .filter((idx) => idx !== -1)
        .sort((a, b) => a - b);

      if (indices.length === 0) return { start: -1, end: -1 };

      const firstIndex = indices[0]!;
      const lastIndex = indices[indices.length - 1]!;
      return { start: firstIndex, end: lastIndex };
    };

    const setHeaderCells = (nodes: HeaderTreeItem[], currentHeaderRowIndex: number): void => {
      nodes.forEach((node) => {
        const span = getColumnSpan(node);
        const start = span.start;
        const end = span.end;

        if (start !== -1 && end !== -1) {
          for (let colIdx = start; colIdx <= end; colIdx++) {
            panel.setCellData(currentHeaderRowIndex, colIdx, node.HEADER_NAME);
          }

          if (node.children && node.children.length > 0) {
            setHeaderCells(node.children, currentHeaderRowIndex + 1);
          } else {
            for (let rowIdx = currentHeaderRowIndex + 1; rowIdx < maxDepth; rowIdx++) {
              for (let k = start; k <= end; k++) {
                panel.setCellData(rowIdx, k, node.HEADER_NAME);
              }
            }
          }
        } else {
          console.warn(
            `[setHeaderCells] Node "${node.HEADER_NAME}" (ID: ${node.HEADER_ID}) has no valid column span. It will not be rendered as a column or part of merged header.`
          );
        }
      });
    };

    for (let r = 0; r < maxDepth; r++) {
      for (let c = 0; c < grid.columns.length; c++) {
        panel.setCellData(r, c, null);
      }
    }

    setHeaderCells(treeHeaders, 0);

    grid.invalidate();
  }, [headerConfig, buildTreeForPreview]);

  const exportFieldList = (): void => exportFields();

  return (
    <div style={{ padding: '10px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>헤더 관리</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 2px 0' }}>
          <Flex gap='small' wrap>
            <Button
              className='custom-button'
              onClick={exportFieldList}
              style={{ display: showExportButton ? 'block' : 'none' }}
            >
              필드 가져오기
            </Button>
            <Button className='custom-button' onClick={toggleReview}>
              미리보기
            </Button>
            <Button className='custom-button' onClick={() => void save()}>
              저장
            </Button>
          </Flex>
        </div>
      </div>
      <div className='formWrap'>
        <span>논리 테이블명</span>
        <input
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb', fontSize: '12px' }}
          disabled={true}
          value={tableNm || ''}
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
              marginTop: '10px',
              display: 'inline-block',
              marginRight: '8px',
            }}
          ></i>
          헤더 목록
        </h4>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 4px 0' }}>
          <Flex gap='small' wrap>
            <Button className='custom-button' onClick={toggleTreeCollapse}>
              펼치기/접기
            </Button>
            <Button className='custom-button' onClick={addRow}>
              행추가
            </Button>
            <Button className='custom-button' onClick={deleteRows}>
              행삭제
            </Button>
          </Flex>
        </div>
      </div>
      <div style={{ margin: '2px' }}>
        <FlexGrid
          itemsSource={gridData || []}
          ref={gridRef}
          headersVisibility='Column'
          selectionMode='Row'
          autoGenerateColumns={false}
          childItemsPath='deps'
          allowSorting={false}
          isReadOnly={false}
          loadedRows={onLoadedRows}
          formatItem={formatItem}
          beginningEdit={onBeginningEdit}
          initialized={(grid: wjGrid.FlexGrid) => {
            grid.cellEditEnded.addHandler((s: wjGrid.FlexGrid, e: CellRangeEventArgs) => {
              const oldValue = e.data as unknown;
              const newValue = s.getCellData(e.row, e.col, false) as unknown;

              const row = e.row;
              const col = e.col;

              if (col === 6) {
                console.log(s);
              }

              console.log('row', row);
              console.log('col', col);

              if (oldValue !== newValue) {
                const rowObj = e.getRow();
                const dataItem = (rowObj?.dataItem as HeaderItem | undefined) ?? undefined;
                if (dataItem) {
                  markAsEdited(s, dataItem);
                }
              }
            });
          }}
        >
          <FlexGridColumn binding='temp' header='' width={0} />
          <FlexGridColumn binding='selected' header='선택' width={50} dataType='Boolean' />
          <FlexGridColumn binding='HEADER_ID' header='헤더 ID' />
          <FlexGridColumn binding='HEADER_NAME' header='헤더명' width='*' />
          <FlexGridColumn binding='SUPI_HEADER' header='상위헤더' width='*' dataMap={supiHeaderMap ?? null} />
          <FlexGridColumn binding='HEADER_WIDTH' header='넓이' width='0.3*' dataType={'Number'} />
          <FlexGridColumn binding='CONN_FIELD' header='연결필드' width='*' dataMap={statusMap} />
          <FlexGridColumn binding='SORT_SN' header='정렬순서' width={80} dataType={'Number'} />
          <FlexGridColumn binding='TABLE_SEQ' header='SEQ' visible={false} />
        </FlexGrid>
      </div>
      <div style={{ marginTop: '10px', display: reviewFlag ? 'block' : 'none' }}>
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
          미리보기
        </h4>
        <div style={{ margin: '2px' }}>
          <FlexGrid
            allowMerging='ColumnHeaders'
            alternatingRowStep={0}
            initialized={onPreviewGridInitialized}
            itemsSource={[]}
            ref={previewGridRef}
            autoGenerateColumns={false}
            allowSorting={false}
            allowDragging='None'
          ></FlexGrid>
        </div>
      </div>
    </div>
  );
};

export default LmsHeader;
