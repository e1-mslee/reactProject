import '@mescius/wijmo.styles/wijmo.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Lms.css';
import '@mescius/wijmo.cultures/wijmo.culture.ko';
import 'react-datepicker/dist/react-datepicker.css';
import api from './../api/api.js';
import { FlexGrid, FlexGridColumn } from '@mescius/wijmo.react.grid';
import { DataMap, CellType } from '@mescius/wijmo.grid';
import { CollectionView } from '@mescius/wijmo';
import { MultiRow } from '@mescius/wijmo.react.grid.multirow';
import { useState, useEffect, useRef, useCallback } from 'react';
import useEvent from 'react-use-event-hook';
import { Button, Flex, Modal, message } from 'antd';
import * as wjcGrid from '@mescius/wijmo.react.grid';
import * as wjGrid from '@mescius/wijmo.grid';

const LmsHeader = () => {
  const params = new URLSearchParams(window.location.search);
  const tableSeq = params.get('tableSeq');
  const tableNm = params.get('tableNm');
  const gridRef = useRef(null);
  const [gridData, setGridData] = useState([]);
  const [isCollapsedAll, setIsCollapsedAll] = useState(false); // false: 펼침 상태
  const [reviewFlag, setReviewFlag] = useState(true); // true: 펼침 상태
  const [tableField, setTableField] = useState([]);
  const [supiHeaderMap, setSupiHeaderMap] = useState(null);

  const extractHeaderOptions = (items) =>
    items.map((item) => ({
      value: item.HEADER_ID,
      name: item.HEADER_NAME,
    }));

  const fetchGridData = useCallback(async () => {
    try {
      const res = await api.post('/api/getHeaderList', String(tableSeq));
      const treeData = buildTree(res.data); // ← 여기서 트리로 변환
      console.log('treeData', treeData);
      setGridData(new CollectionView(treeData, { trackChanges: true }));
      const headerOptions = extractHeaderOptions(res.data);
      const withEmptyOption = [{ value: '', name: '\u00A0' }, ...headerOptions];
      setSupiHeaderMap(new DataMap(withEmptyOption, 'value', 'name'));
    } catch (err) {
      console.error('필드 목록 불러오기 오류:', err);
    }
  }, [tableSeq]);

  const statusMap = new DataMap(tableField, 'COL_ID', 'COL_NAME');

  const fetchGridfield = async () => {
    try {
      const res = await api.post('/api/getTableFieldList', String(tableSeq));

      const withEmptyOption = [{ COL_ID: ' ', COL_NAME: '\u00A0' }, ...res.data];
      setTableField(withEmptyOption);
      console.log(withEmptyOption);
    } catch (err) {
      console.error('필드 불러오기 오류:', err);
    }
  };

  const buildTree = (flatList) => {
    const map = {};
    const roots = [];

    flatList.forEach((item) => {
      item.selected = Boolean(item.selected);
      map[item.HEADER_ID] = item;
      item.deps = []; // 일반 배열 유지
    });

    flatList.forEach((item) => {
      if (item.SUPI_HEADER) {
        const parent = map[item.SUPI_HEADER];
        if (parent) {
          parent.deps.push(item); // 배열로 자식 추가
        } else {
          roots.push(item);
        }
      } else {
        roots.push(item);
      }
    });

    return roots;
  };

  const onTableHeaderSave = () => {
    if (!gridData) return;

    const addItems = (gridData.itemsAdded || []).map((item) => ({ ...item, STATUS: 'ADD' }));
    const editItems = (gridData.itemsEdited || []).map((item) => ({
      ...item,
      STATUS: 'UPD',
    }));
    const removeItems = (gridData.itemsRemoved || []).map((item) => ({ ...item, STATUS: 'DEL' }));

    const sendItems = [...addItems, ...editItems, ...removeItems];

    if (sendItems.length === 0) {
      message.error('수정된 행이 없습니다.');
      return;
    }

    Modal.confirm({
      title: '알림',
      content: '저장하시겠습니까?',
      style: { top: 200 },
      async onOk() {
        try {
          await api.post('/api/saveHeaderList', sendItems);
          message.success('저장되었습니다.');
          await fetchGridData();
        } catch (error) {
          console.error('저장 오류:', error);
          message.error('저장 중 오류가 발생했습니다.');
        }
      },
    });
  };

  const addRow = () => {
    if (!gridData) return;

    const newRow = {
      selected: false,
      HEADER_ID: getNextHeaderId(),
      HEADER_NAME: '',
      SUPI_HEADER: '',
      HEADER_WIDTH: null,
      CONN_FIELD: '',
      SORT_SN: null,
      TABLE_SEQ: tableSeq,
      deps: [],
    };

    const newItem = gridData.addNew(); // 새 행 시작
    Object.assign(newItem, newRow); // 기본값 채우기
    gridData.commitNew(); // 추가 확정
  };

  const findSelectedItems = (items) => {
    let result = [];

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

  function findParent(items, targetItem) {
    for (const item of items) {
      if (item.deps && item.deps.includes(targetItem)) {
        return item; // targetItem의 부모를 찾음
      }
      if (item.deps && item.deps.length > 0) {
        const parent = findParent(item.deps, targetItem);
        if (parent) return parent;
      }
    }
    return null; // 부모를 못 찾음 (루트 노드일 수도)
  }

  const deleteRows = () => {
    const grid = gridRef.current?.control;
    if (!grid) return;

    const allItems = grid.collectionView.items;
    const selectedItems = findSelectedItems(allItems);

    if (selectedItems.length === 0) {
      message.warning('삭제할 행을 선택하세요.');
      return;
    }

    Modal.confirm({
      title: '알림',
      content: '삭제 하시겠습니까?',
      onOk: () => {
        const removedItems = [];

        selectedItems.forEach((item) => {
          const parent = findParent(allItems, item);

          if (parent) {
            const idx = parent.deps.indexOf(item);
            if (idx !== -1) {
              parent.deps.splice(idx, 1);
              removedItems.push(item);
            }
          } else {
            const idx = allItems.indexOf(item);
            if (idx !== -1) {
              allItems.splice(idx, 1);
              removedItems.push(item);
            }
          }
        });

        const view = grid.collectionView;
        if (view && view.itemsRemoved) {
          removedItems.forEach((item) => {
            if (!view.itemsRemoved.includes(item)) {
              view.itemsRemoved.push(item);
            }
          });
        }

        grid.collectionView.refresh();
        message.success('선택한 행들이 삭제되었습니다.');
      },
    });
  };

  const toggleTreeCollapse = () => {
    const grid = gridRef.current?.control;
    if (!grid) return;

    grid.rows.forEach((row) => {
      if (row.hasChildren) {
        row.isCollapsed = !isCollapsedAll;
      }
    });

    setIsCollapsedAll(!isCollapsedAll);
  };

  useEffect(() => {
    const link = document.querySelector('a[href="https://www.mescius.co.kr/wijmo#price"]');
    if (link) {
      link.remove();
    }

    fetchGridData();
    fetchGridfield();
  }, [fetchGridData]);

  const onLoadedRows = (s, e) => {
    // 모든 rows를 순회하며 수정 가능하게 설정
    for (let i = 0; i < s.rows.length; i++) {
      s.rows[i].isReadOnly = false;
    }
  };

  const formatItem = (s, e) => {
    // 셀 타입이 아니면 무시
    if (e.panel.cellType !== CellType.Cell) return;

    const col = s.columns[e.col];
    const row = s.rows[e.row];

    // 1. 첫 번째 컬럼에서 기본 트리 아이콘 제거
    if (col.index === 0) {
      e.cell.innerHTML = '';
      e.cell.style.paddingLeft = '';
      return;
    }

    if (s.editRange && s.editRange.row === e.row && s.editRange.col === e.col) {
      return;
    }

    // 2. HEADER_NAME 컬럼에 트리 아이콘 넣기
    if (col.binding === 'HEADER_NAME') {
      const padding = row.level * 18;

      if (row.hasChildren) {
        const iconClass = row.isCollapsed ? 'wj-glyph-right' : 'wj-glyph-down-right';

        // 버튼 + 텍스트 렌더링
        e.cell.innerHTML = `
        <div style="display: flex; align-items: center; padding-left: ${padding}px;">
          <button class="wj-btn wj-btn-glyph wj-elem-collapse" tabindex="-1" aria-label="Toggle Group">
            <span class="${iconClass}"></span>
          </button>
          <span style="margin-left: 4px;">${row.dataItem.HEADER_NAME}</span>
        </div>
      `;

        // 버튼 클릭 이벤트 (토글)
        const button = e.cell.querySelector('button');
        if (button) {
          button.onclick = (evt) => {
            row.isCollapsed = !row.isCollapsed;
            s.invalidate(); // 갱신
            evt.stopPropagation(); // 행 선택 방지
          };
        }
      } else {
        // 자식 없는 경우 텍스트만
        e.cell.innerHTML = `<div style="padding-left: ${padding + 20}px;">${row.dataItem.HEADER_NAME}</div>`;
      }
    }
  };

  const onBeginningEdit = useEvent((flexGird, e) => {
    let item = flexGird.rows[e.row].dataItem,
      binding = flexGird.columns[e.col].binding;
    if (!(binding in item) || binding == 'HEADER_ID') {
      e.cancel = true;
    }
  });

  function markAsEdited(grid, item) {
    let existingItem = grid.collectionView.itemsEdited.find((_item) => _item === item);
    if (!existingItem) {
      grid.collectionView.itemsEdited.push(item);
    }
  }

  const getNextHeaderId = () => {
    if (!gridData || !gridData.items) return 'HEAD_001';

    let max = 0;

    const walk = (items) => {
      items.forEach((item) => {
        const match = /^HEAD_(\d+)$/.exec(item.HEADER_ID);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > max) max = num;
        }
        // 자식도 재귀적으로 탐색
        if (Array.isArray(item.deps)) {
          walk(item.deps);
        }
      });
    };

    walk(gridData.items);

    const nextNum = max + 1;
    return `HEAD_${String(nextNum).padStart(3, '0')}`;
  };

  const onInitialized = useEvent((grid) => {
    // create extra header row
    var extraRow = new wjGrid.Row();
    extraRow.allowMerging = true;
    //
    // add extra header row to the grid
    var panel = grid.columnHeaders;
    panel.rows.splice(0, 0, extraRow);
    //
    // populate the extra header row
    for (let colIndex = 1; colIndex <= 2; colIndex++) {
      panel.setCellData(0, colIndex, 'Amounts');
    }
    //
    // merge "Country" and "Active" headers vertically
    ['country', 'active'].forEach(function (binding) {
      let col = grid.getColumn(binding);
      col.allowMerging = true;
      panel.setCellData(0, col.index, col.header);
    });
    //
    // center-align merged header cells
    grid.formatItem.addHandler(function (s, e) {
      if (e.panel == s.columnHeaders && e.range.rowSpan > 1) {
        var html = e.cell.innerHTML;
        e.cell.innerHTML = '<div class="v-center">' + html + '</div>';
      }
    });
    grid.autoGenerateColumns = false;
    // grid.itemsSource = getData();
  });

  return (
    <div style={{ padding: '10px', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>헤더 관리</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '2px 0 2px 0' }}>
          <Flex gap="small" wrap>
            <Button className="custom-button">필드 가져오기</Button>
            <Button className="custom-button" onClick={() => setReviewFlag((prev) => !prev)}>
              미리보기
            </Button>
            <Button className="custom-button" onClick={onTableHeaderSave}>
              저장
            </Button>
          </Flex>
        </div>
      </div>
      <div className="formWrap">
        <span>논리 테이블명</span>
        <input
          style={{ width: '300px', height: '28px', border: '1px solid #dbdbdb', fontSize: '12px' }}
          disabled={true}
          value={tableNm}
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
          <Flex gap="small" wrap>
            <Button className="custom-button" onClick={toggleTreeCollapse}>
              펼치기/접기
            </Button>
            <Button className="custom-button" onClick={addRow}>
              행추가
            </Button>
            <Button className="custom-button" onClick={deleteRows}>
              행삭제
            </Button>
          </Flex>
        </div>
      </div>
      <div style={{ margin: '2px' }}>
        <FlexGrid
          itemsSource={gridData}
          ref={gridRef}
          headersVisibility="Column"
          selectionMode="Row"
          autoGenerateColumns={false}
          childItemsPath="deps"
          allowSorting={false}
          isReadOnly={false}
          loadedRows={onLoadedRows}
          formatItem={formatItem}
          beginningEdit={onBeginningEdit}
          initialized={(grid) => {
            grid.cellEditEnded.addHandler((s, e) => {
              const col = s.columns[e.col];
              const item = s.rows[e.row].dataItem;
              let oldValue = e.data;
              let newValue = s.getCellData(e.row, e.col);

              if (oldValue !== newValue) {
                markAsEdited(s, e.getRow().dataItem);
              }
              console.log('col', col);
              console.log('item', item);
            });
          }}
        >
          <FlexGridColumn binding="temp" header="" width={0} />
          <FlexGridColumn binding="selected" header="선택" width={50} dataType="Boolean" />
          <FlexGridColumn binding="HEADER_ID" header="헤더 ID" />
          <FlexGridColumn binding="HEADER_NAME" header="헤더명" width="*" />
          <FlexGridColumn binding="SUPI_HEADER" header="상위헤더" width="*" dataMap={supiHeaderMap} />
          <FlexGridColumn binding="HEADER_WIDTH" header="넓이" width="0.3*" dataType="Number" />
          <FlexGridColumn binding="CONN_FIELD" header="연결필드" width="*" dataMap={statusMap} />
          <FlexGridColumn binding="SORT_SN" header="정렬순서" width={80} dataType="Number" />
          <FlexGridColumn binding="TABLE_SEQ" header="SEQ" visible={false} />
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
          <FlexGrid allowMerging="ColumnHeaders" alternatingRowStep={0} initialized={onInitialized}>
            <FlexGridColumn binding="country" header="Country" width="*" allowMerging={true} />
            <FlexGridColumn binding="sales" header="Sales" width="*" format="n2" />
            <FlexGridColumn binding="expenses" header="Expenses" width="*" format="n2" />
            <FlexGridColumn binding="active" header="Active" width="*" allowMerging={true} />
          </FlexGrid>
        </div>
      </div>
    </div>
  );
};

export default LmsHeader;
