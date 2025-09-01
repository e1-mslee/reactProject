package com.e1.backend.serviceimpl;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.RegionUtil;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.e1.backend.mapper.ApiMapper;
import com.e1.backend.service.ApiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiServiceImpl implements ApiService {

    private final ApiMapper apiMapper;
    
    @Override
    public List<Map<String, Object>> getAllCode() {
        return apiMapper.selectAllCode();
    }

    @Override
    public List<Map<String, Object>> selectMainTableInfoList(Map<String, Object> data) {
        
        List<Map<String,Object>> resultMap = apiMapper.selectMainTableInfoList(data);
        List<Map<String,Object>> tableMap = apiMapper.selectMainTableIdList(data);

        List<String> tableList = tableMap.stream()
            .map(m -> String.valueOf(m.get("TABLE_ID")))
            .collect(Collectors.toList());

        List<Map<String,Object>> countList = tableList.isEmpty()
            ? Collections.emptyList()
            : apiMapper.unionCountTableQuery(tableList);

        Map<String, Object> tableCountMap = (countList == null ? Collections.<Map<String,Object>>emptyList() : countList)
            .stream()
            .collect(Collectors.toMap(
                row -> String.valueOf(row.get("TABLE_ID")),
                row -> row.get("cnt")
            ));

        for (Map<String, Object> item : resultMap) {
            String tableId = String.valueOf(item.get("TABLE_ID"));
            item.put("field_count", tableCountMap.getOrDefault(tableId, 0));
        }

        return resultMap;
    }

    @Override
    @Transactional
    public void deleteMainTableInfo(List<String> data) {
        log.info("deleteMainTableInfo data = {}", data);

        if (data == null || data.isEmpty()) {
            return;
        }

       for (String tableSeq : data) {
        String check = apiMapper.tableexistCheck(tableSeq);
        log.info("tableSeq = {}, check = {}", tableSeq, check);
            if(check != null) {
                int tableCount = apiMapper.tableCountInfo(check);
                if(tableCount > 0) {
                    continue;
                }
                apiMapper.dropTable(check);
            }
        }

       apiMapper.deleteMainTableInfo(data);
       apiMapper.removeTablefield(data);
       apiMapper.removeTableHeader(data);
    }

    @Override
    @Transactional
    public void saveMainTableInfo(List<Map<String,Object>> data) {

        for (Map<String, Object> item : data) {
            if (item.get("TABLE_SEQ") == null || item.get("TABLE_SEQ").toString().isEmpty()) {
                apiMapper.insertMainTableInfo(item);
            } else {
                apiMapper.updateMainTableInfo(item);
            }
        }

    }

    @Override
    public List<Map<String, Object>> getTableFieldList(String tableSeq) {
        return apiMapper.selectFieldList(tableSeq);
    }

    @Override
    @SuppressWarnings("unchecked")
    @Transactional
    public void saveTableFieldList(Map<String, Object> data) {
        if (data == null) {return;}
        log.info("data List ={}",data);
        Map<String, Object> gridInfo = (Map<String, Object>) data.get("gridInfo");

        List<Map<String,Object>> codeList = apiMapper.selectAllCode();
        
        Map<String, String> codeMap = codeList.stream()
            .collect(Collectors.toMap(
                e -> String.valueOf(e.get("COM_CD")),
                e -> String.valueOf(e.get("COM_CD_EN"))
            )
        );
        
        List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
        if (items == null || items.isEmpty()) {return;}
        
        for (Map<String, Object> item : items) {
            String status = String.valueOf(item.get("STATUS"));
            if ("INS".equals(status)) {
                apiMapper.insertTableField(item);
            } else if ("UPD".equals(status)) {
                apiMapper.updateTableField(item);
            } else if ("DEL".equals(status)) {
                 apiMapper.deleteTablefield(item);
            }
        }
        
        String tableSeq = String.valueOf(gridInfo.get("TABLE_SEQ"));
        String chackFlag = apiMapper.tableCreateCheck(tableSeq);        

        if(chackFlag != null) {
            apiMapper.dropTable(chackFlag);
        }
        StringBuilder tableQuery = new StringBuilder();
        StringBuilder pkList = new StringBuilder();
        StringBuilder indexList = new StringBuilder();

        List<Map<String, Object>> colList = apiMapper.selectFieldList(tableSeq);

        tableQuery.append("create table ").append(gridInfo.get("TABLE_ID")).append(" (");
        for (Map<String, Object> item : colList) {
            String colName = String.valueOf(item.get("COL_NAME"));
            String colTypeKey = String.valueOf(item.get("COL_TYPE"));
            String colSize = String.valueOf(item.get("COL_SIZE"));
            String colType = codeMap.getOrDefault(colTypeKey, colTypeKey);
            String primaryKey = String.valueOf(item.get("COL_IDX"));
            String indexKey = String.valueOf(item.get("COL_SCH"));

            if(primaryKey.equals("1")){
               pkList.append(colName).append(",");
            }

            if(colType.equals("VARCHAR")){
                colType = colType + "(" + colSize + ")";
            }

            if(indexKey.equals("1")){
               indexList.append(colName).append(",");
            }

            tableQuery.append(colName).append(" ").append(colType).append(", ");
        }
        if (tableQuery.lastIndexOf(", ") == tableQuery.length() - 2) {
            tableQuery.delete(tableQuery.length() - 2, tableQuery.length());
        }
        
        if(pkList.length() > 0){
            pkList.deleteCharAt(pkList.length() - 1);
            tableQuery.append(", PRIMARY KEY (").append(pkList).append(")");
        }

        if(indexList.length() > 0){
            indexList.deleteCharAt(indexList.length() - 1);
            tableQuery.append(", INDEX (").append(indexList).append(")");
        }

        tableQuery.append(")");
        String finalQuery = tableQuery.toString();

        if(!finalQuery.isEmpty()){
             apiMapper.createTable(finalQuery);
        }

    }

    @Override
    public List<Map<String, Object>> getMainTableInfoData(String tableSeq) {
        return apiMapper.getMainTableInfoData(tableSeq);
    }

    @Override
    public List<Map<String, Object>> getHeaderList(String tableSeq) {
        return apiMapper.getHeaderList(tableSeq);
    }

    @Override
    @Transactional
    public void saveHeaderList(List<Map<String, Object>> data) {
        for (Map<String, Object> item : data) {
            if ("ADD".equals(item.get("STATUS"))) {
                apiMapper.insertHeaderList(item);
            } else if("UPD".equals(item.get("STATUS"))){
                apiMapper.updateHeaderList(item);
            } else if ("DEL".equals(item.get("STATUS"))){
                apiMapper.deleteHeaderList(item);
            }
        }
    }

    @Override
    public Map<String,Object> tableValidationCheck(String tableSeq) {
        String existCheck = apiMapper.tableexistCheck(tableSeq);
        Map<String,Object> resultMap = new HashMap<>();
        Boolean result = true;
        log.info(existCheck);
        if(existCheck != null) {
            int tableCount = apiMapper.tableCountInfo(existCheck);
            if(tableCount > 0) {
                result = false;
            }
        }

        resultMap.put("FLAG", result);
        return resultMap;
    }

    private CellStyle createHeaderCellStyle(Workbook workbook) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setFontName("맑은 고딕");
        headerFont.setFontHeightInPoints((short)9);
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER); 
        headerStyle.setFillForegroundColor(new XSSFColor(new byte[] {(byte) 233,(byte) 233,(byte) 233}, null));
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);    
        headerStyle.setBorderRight(BorderStyle.THIN);
        return headerStyle;
    }

    @Override
    public byte[] generateExcel(String tableSeq) throws Exception {
        List<Map<String, Object>> headerList = apiMapper.getHeaderList(tableSeq);

        Map<String, List<Map<String, Object>>> parentToChild = new HashMap<>();
        List<Map<String, Object>> rootHeaders = new ArrayList<>();
        for (Map<String, Object> header : headerList) {
            String supiHeader = String.valueOf(header.get("SUPI_HEADER"));
            if (supiHeader == null || supiHeader.isEmpty() || supiHeader.equals("null")) {
                rootHeaders.add(header);
            } else {
                parentToChild.computeIfAbsent(supiHeader, k -> new ArrayList<>()).add(header);
            }
        }
        log.info("parentToChild: {}", parentToChild);

        int maxDepth = 0;
        for (Map<String,Object> root : rootHeaders) {
            maxDepth = Math.max(maxDepth, getMaxDepth(parentToChild, root));
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("문서양식");
            createHeaderRows(sheet, workbook, parentToChild, rootHeaders, 0, 0, maxDepth);
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private int createHeaderRows(Sheet sheet, Workbook workbook,
                             Map<String, List<Map<String, Object>>> parentToChild,
                             List<Map<String, Object>> headers,
                             int rowIndex,
                             int colIndex,
                             int maxDepth) {

        Row row = sheet.getRow(rowIndex);
        if (row == null) row = sheet.createRow(rowIndex);

        int currentCol = colIndex;

        for (Map<String, Object> header : headers) {
            String headerId = String.valueOf(header.get("HEADER_ID"));
            String headerName = String.valueOf(header.get("HEADER_NAME"));
            String headerWidth = String.valueOf(header.get("HEADER_WIDTH"));

            List<Map<String, Object>> children = parentToChild.get(headerId);

            if (children != null && !children.isEmpty()) {
                int childStartCol = currentCol;
                currentCol = createHeaderRows(sheet, workbook, parentToChild, children, rowIndex + 1, currentCol, maxDepth);
                int childEndCol = currentCol - 1;

                // 부모 셀 생성
                Cell parentCell = row.createCell(childStartCol);
                parentCell.setCellValue(headerName);
                parentCell.setCellStyle(createHeaderCellStyle(workbook));

                // 최소 2셀 이상일 때 가로 병합
                if (childEndCol > childStartCol) {
                    CellRangeAddress region = new CellRangeAddress(rowIndex, rowIndex, childStartCol, childEndCol);
                    sheet.addMergedRegion(region);
                    setRegionBorder(region, sheet);
                }

            } else { // 단일 셀
                Cell cell = row.createCell(currentCol);
                cell.setCellValue(headerName);
                cell.setCellStyle(createHeaderCellStyle(workbook));

                int mergeRows = maxDepth - rowIndex;
                if (mergeRows > 1) {
                    CellRangeAddress region = new CellRangeAddress(rowIndex, rowIndex + mergeRows - 1, currentCol, currentCol);
                    sheet.addMergedRegion(region);
                    setRegionBorder(region, sheet);
                }

                // 컬럼 너비 적용
                try {
                    int width = Integer.parseInt(headerWidth);
                    sheet.setColumnWidth(currentCol, width * 64);
                } catch (NumberFormatException e) {
                    sheet.setColumnWidth(currentCol, 15 * 64);
                }

                currentCol++;
            }
        }

        return currentCol;
    }

    private int getMaxDepth(Map<String, List<Map<String,Object>>> parentToChild, Map<String,Object> header){
        List<Map<String,Object>> children = parentToChild.get(String.valueOf(header.get("HEADER_ID")));
        if(children == null || children.isEmpty()) return 1;
        int max = 0;
        for(Map<String,Object> child : children){
            max = Math.max(max, getMaxDepth(parentToChild, child));
        }
        return max + 1;
    }

    private void setRegionBorder(CellRangeAddress region, Sheet sheet) {
        RegionUtil.setBorderTop(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderBottom(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderLeft(BorderStyle.THIN, region, sheet);
        RegionUtil.setBorderRight(BorderStyle.THIN, region, sheet);
    }

    @Override
    public List<Map<String, Object>> getTableDataList(String tableSeq) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Map<String, Object>> columnList = apiMapper.changeFiledNm(tableSeq);
        //log.info("columnList = {}",columnList);

        String chackFlag = apiMapper.tableCreateCheck(tableSeq);
        
        if(chackFlag != null && !chackFlag.isEmpty()) {
            result = apiMapper.tableDataList(chackFlag);
            //log.info("result = {}",result);

            // 컬럼명 매핑 적용
            for (Map<String, Object> row : result) {
                for (Map<String, Object> col : columnList) {
                    String dbCol = (String) col.get("COL_NAME");      // 원래 DB 컬럼명
                    String alias = (String) col.get("HEADER_NAME");   // 바꿀 이름
                    if (row.containsKey(dbCol)) {
                        Object val = row.remove(dbCol);
                        row.put(alias, val);
                    }
                }
            }
            
        }

        return result;
    }

    @Override
    @Transactional
    public void excelUpload(MultipartFile file, String tableSeq) {
        List<Map<String, Object>> headerList = apiMapper.getHeaderList(tableSeq);

        Map<String, List<Map<String, Object>>> parentToChild = new HashMap<>();
        List<Map<String, Object>> rootHeaders = new ArrayList<>();
        for (Map<String, Object> header : headerList) {
            String supiHeader = String.valueOf(header.get("SUPI_HEADER"));
            if (supiHeader == null || supiHeader.isEmpty() || supiHeader.equals("null")) {
                rootHeaders.add(header);
            } else {
                parentToChild.computeIfAbsent(supiHeader, k -> new ArrayList<>()).add(header);
            }
        }

        log.info("parentToChild = {}", parentToChild);

        int maxDepth = 0;
        for (Map<String,Object> root : rootHeaders) {
            maxDepth = Math.max(maxDepth, getMaxDepth(parentToChild, root));
        }

        log.info("maxDepth= {}",maxDepth);


        try (
            InputStream is = file.getInputStream();
            Workbook workbook = WorkbookFactory.create(is)
        ) {
            Sheet sheet = workbook.getSheetAt(0);

            List<List<String>> headerRows = new ArrayList<>();
            for (int r = 0; r < maxDepth; r++) {
                List<String> rowHeaders = new ArrayList<>();
                for (int c = 0; c < sheet.getRow(r).getLastCellNum(); c++) {
                    String value = getMergedCellValue(sheet, r, c);
                    rowHeaders.add(value);
                }
                headerRows.add(rowHeaders);
            }

            List<String> lowestHeaders = headerRows.get(maxDepth - 1);

            List<Map<String, Object>> rowDataList = new ArrayList<>();
            for (int r = maxDepth; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Map<String, Object> rowData = new HashMap<>();
                for (int c = 0; c < lowestHeaders.size(); c++) {
                    Cell cell = row.getCell(c);

                    Object value = getCellStringValue(cell);
                    rowData.put(lowestHeaders.get(c), value);
                }
                rowDataList.add(rowData);
            }

            log.info("rowDataList = {}",rowDataList);
            log.info("lowestHeaders = {}",lowestHeaders);

            if(rowDataList.size()>0){
                String chackFlag = apiMapper.tableCreateCheck(tableSeq);
                if(chackFlag != null && !chackFlag.isEmpty()) {
                    apiMapper.deleteDataTable(chackFlag);
                    batchInsertDynamicData(tableSeq, chackFlag, lowestHeaders, rowDataList);
                }
            }

        } catch (Exception e) {
            throw new RuntimeException("엑셀 업로드 실패", e);
        }
    }

    public void batchInsertDynamicData(String tableSeq, String tableName, List<String> lowestHeaders, List<Map<String, Object>> rowDataList) {
        if (rowDataList.isEmpty()) return;
        List<Map<String, Object>> columnList = apiMapper.changeFiledNm(tableSeq);

        Map<String, String> headerToCol = new HashMap<>();
        for (Map<String, Object> colMap : columnList) {
            String headerName = String.valueOf(colMap.get("HEADER_NAME"));
            String colName = String.valueOf(colMap.get("COL_NAME"));
            headerToCol.put(headerName, colName);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO ").append(tableName).append(" (");

        for (int i = 0; i < lowestHeaders.size(); i++) {
            if (i > 0) sb.append(", ");
            String header = lowestHeaders.get(i);
            String colName = headerToCol.get(header);
            sb.append(colName);
        }

        sb.append(") VALUES ");

        for (int r = 0; r < rowDataList.size(); r++) {
            if (r > 0) sb.append(", ");
            sb.append("(");
            Map<String,Object> row = rowDataList.get(r);
            for (int c = 0; c < lowestHeaders.size(); c++) {
                if (c > 0) sb.append(", ");
                Object val = row.get(lowestHeaders.get(c));
                if (val == null) sb.append("NULL");
                else sb.append("'").append(val.toString().replace("'", "''")).append("'");
            }
            sb.append(")");
        }

        apiMapper.insertDataTable(sb.toString());
    }

    private String getMergedCellValue(Sheet sheet, int rowIndex, int colIndex) {
        for (CellRangeAddress range : sheet.getMergedRegions()) {
            if (range.isInRange(rowIndex, colIndex)) {
                // 병합된 셀의 첫 번째 셀 좌표
                Row firstRow = sheet.getRow(range.getFirstRow());
                if (firstRow != null) {
                    Cell firstCell = firstRow.getCell(range.getFirstColumn());
                    return getCellStringValue(firstCell);
                }
            }
        }

        // 병합 영역이 아닌 일반 셀
        Row row = sheet.getRow(rowIndex);
        if (row != null) {
            Cell cell = row.getCell(colIndex);
            return getCellStringValue(cell);
        }
        return "";
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell) ?
                            cell.getDateCellValue().toString() :
                            String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }
}
