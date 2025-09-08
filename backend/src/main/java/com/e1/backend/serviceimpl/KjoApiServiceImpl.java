package com.e1.backend.serviceimpl;

import com.e1.backend.mapper.KjoApiMapper;
import com.e1.backend.service.KjoApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class KjoApiServiceImpl implements KjoApiService {
    private final KjoApiMapper kjoApiMapper;

    @Override
    public List<Map<String, Object>> selectMainTable(Map<String, Object> data) {
        List<Map<String, Object>> listMap = kjoApiMapper.selectMainTable(data);

        for(Map<String, Object> map : listMap){
            int table = kjoApiMapper.findTable(map);

            if(table > 0) {
                int dataCount = kjoApiMapper.selectDataCount(map);
                map.put("dataCount", dataCount);
            }
        }

        return listMap;
    }

    @Override
    @Transactional
    public ResponseEntity<?> insertMainTable(List<Map<String, Object>> data) {
        kjoApiMapper.insertMainTable(data);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<?> updateMainTable(Map<String, Object> data) {
        kjoApiMapper.updateMainTable(data);
        return ResponseEntity.ok().build();
    }

    @Override
    @Transactional
    public ResponseEntity<?> deleteMainTable(List<Map<String, Object>> data) {
        kjoApiMapper.deleteMainTable(data);

        String query = "";
        for(Map<String, Object> map : data) {
            String tableId = map.get("tableId").toString();

            kjoApiMapper.deleteFieldTable(map);

            kjoApiMapper.deleteHeaderTable(map);

            if(!tableId.isEmpty()){
                query = "drop table if exists " + tableId;
                kjoApiMapper.definitionMainTable(query);
            }
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public Map<String, Object> selectTableName(Map<String, Object> data) {
        Map<String, Object> listMap = kjoApiMapper.selectTableName(data);

        int table = kjoApiMapper.findTable(listMap);

        if(table > 0) {
            int dataCount = kjoApiMapper.selectDataCount(listMap);
            listMap.put("dataCount", dataCount);
        }

        return listMap;
    }

    @Override
    public List<Map<String, Object>> selectFieldTable(Map<String, Object> data) {
        return kjoApiMapper.selectFieldTable(data);
    }

    @Override
    @Transactional
    public ResponseEntity<?> saveFieldTable(Map<String, Object> data) {
        List<Map<String, Object>> added = (List<Map<String, Object>>) data.get("added");
        List<Map<String, Object>> edited = (List<Map<String, Object>>) data.get("edited");
        List<Map<String, Object>> removed = (List<Map<String, Object>>) data.get("removed");

        if(!added.isEmpty())
            kjoApiMapper.insertFieldTable(added);

        if(!edited.isEmpty()) {
            for (Map<String, Object> map : edited) {
                kjoApiMapper.updateFieldTable(map);
            }
        }

        if(!removed.isEmpty()) {
            for(Map<String, Object> map : removed) {
                kjoApiMapper.deleteFieldTable(map);
            }
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public List<Map<String, Object>> selectHeaderTable(Map<String, Object> data) {
        List<Map<String, Object>> listMap = kjoApiMapper.selectHeaderTable(data);

        List<Map<String, Object>> result = sortTreePostOrder(listMap);

        return result;
    }

    @Override
    public ResponseEntity<?> saveHeaderTable(Map<String, List<Map<String, Object>>> data) {
        List<Map<String, Object>> added = data.get("added");
        List<Map<String, Object>> edited = data.get("edited");
        List<Map<String, Object>> removed = data.get("removed");

        if(!added.isEmpty())
            kjoApiMapper.insertHeaderTable(added);

        if(!edited.isEmpty()) {
            for (Map<String, Object> map : edited) {
                kjoApiMapper.updateHeaderTable(map);
            }
        }

        if(!removed.isEmpty()) {
            for(Map<String, Object> map : removed) {
                kjoApiMapper.deleteHeaderTable(map);
            }
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public List<Map<String, Object>> selectHeaderId(Map<String, Object> data) {
        return kjoApiMapper.selectHeaderId(data);
    }

    @Override
    public List<Map<String, Object>> selectGridHeaderTable(Map<String, Object> data) {
        List<Map<String, Object>> listMap = kjoApiMapper.selectGridHeaderTable(data);
        List<Map<String, Object>> result = new ArrayList<>(listMap);

        int maxDept = listMap.stream()
                            .mapToInt(x -> Integer.parseInt(x.get("dept").toString()))
                            .max().orElse(0);

        for(int idx = 0; idx < listMap.size(); idx++) {
            Map<String, Object> map = listMap.get(idx);

            if(!map.get("child").toString().equals("0")) continue;

            String supi = Objects.toString(map.get("supiHeader"), null);
            int dept = Integer.parseInt(map.get("dept").toString());

            map.put("cellSize", 1);

            if(dept != maxDept) {
                for(int i = dept+1; i <= maxDept; i++) {
                    Map<String, Object> tmpMap = new HashMap<>(map);
                    tmpMap.put("dept", i);
                    result.add(tmpMap);
                }
            }

            supiData(result, supi, 1);
        }

        result.sort(Comparator.comparing(x -> x.get("sortSn").toString()));

        return result;
    }

    @Override
    @Transactional
    public ResponseEntity<?> createTable(Map<String, Object> data) {
        List<Map<String, Object>> headerTable = kjoApiMapper.selectHeaderTable(data);
        List<Map<String, Object>> maps = kjoApiMapper.selectFieldTable(data);
        List<Map<String, Object>> codeList = kjoApiMapper.selectColTypeCode();
        String maxTableId = kjoApiMapper.selectMaxTableId();

        List<Map<String, Object>> connField = headerTable.stream()
                .filter(d -> d.get("connField") != null && !d.get("connField").toString().isEmpty())
                .toList();

        if (connField.size() != maps.size()) {
            return ResponseEntity.ok().body(1);
        }

        if(maxTableId.isEmpty()) {
            maxTableId = "uda_db_001";
        } else {
            String idSeq = maxTableId.split("_")[2];
            int seq = Integer.parseInt(idSeq) + 1;
            String formatSeq = String.format("%03d", seq);
            maxTableId = "uda_db_" + formatSeq;
        }

        Map<String, String> code =  new HashMap<>();

        for(Map<String, Object> map : codeList){
            code.put((String) map.get("code"), (String) map.get("value"));
        }

        data.put("tableId", maxTableId);

        kjoApiMapper.updateMainTable(data);

        String query;

        if(!maps.isEmpty()) {
            query = "create table " + maxTableId + " (\n";

            query += makeQuery(maps, code);
            query += "\n)";
            kjoApiMapper.definitionMainTable(query);
        }

        return ResponseEntity.ok().build();
    }

    private String makeQuery(List<Map<String, Object>> listMap, Map<String, String> code) {
        List<String> primaryKeys = new ArrayList<>();
        StringBuilder sb = new StringBuilder();

        sb.append("seq int auto_increment,\n");
        primaryKeys.add("seq");

        for(int i = 0; i < listMap.size(); i++) {
            Map<String, Object> map = listMap.get(i);

            String colNm = map.get("colName").toString();
            String colType = map.get("colType").toString();
            String colSize = map.get("colSize").toString();
            boolean colIdx = (map.get("colIdx") instanceof Long) && ((Long)map.get("colIdx")) == 1L; ;

            sb.append(colNm).append(" ").append(code.get(colType));

            if(code.get(colType).equalsIgnoreCase("varchar")) {
                sb.append("(").append(colSize).append(")");
            }
            sb.append(",\n");

            if(colIdx) {
                primaryKeys.add(colNm);
            }
        }

        sb.delete(sb.length() - 2, sb.length());

        if(!primaryKeys.isEmpty()) {
            sb.append(",\n").append("primary key (");

            for(String key : primaryKeys) {
                sb.append(key).append(",");
            }
            sb.delete(sb.length()-1, sb.length());

            sb.append(")");
        }

        return sb.toString();
    }

    @Override
    public ResponseEntity<?> initTable(Map<String, Object> data) {
        String query = "drop table " + data.get("tableId").toString() + "\n";
        kjoApiMapper.definitionMainTable(query);

        data.put("tableId", "");
        kjoApiMapper.updateMainTable(data);

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<?> docDown(Map<String, Object> data) throws Exception {
        List<Map<String, Object>> result = selectGridHeaderTable(data);

        result.sort(Comparator.comparing(x -> x.get("sortSn").toString()));

        List<List<String>> headerList = headerDataInit(result);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Header");

        // 스타일 정의 (중앙정렬 + 테두리)
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        // 3. 헤더 생성 및 병합
        for (int rowIndex = 0; rowIndex < headerList.size(); rowIndex++) {
            Row row = sheet.createRow(rowIndex);

            List<String> cols = headerList.get(rowIndex);
            String prev = null;
            int startCol = 0;

            for (int colIndex = 0; colIndex < cols.size(); colIndex++) {
                String value = cols.get(colIndex);

                // 값이 달라질 때 병합 처리
                if (prev != null && !prev.equals(value)) {
                    if (colIndex - 1 > startCol) {
                        sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, startCol, colIndex - 1));
                    }
                    startCol = colIndex;
                }

                // 셀 생성
                Cell cell = row.createCell(colIndex);
                cell.setCellValue(value);
                cell.setCellStyle(headerStyle);

                prev = value;
            }

            // 마지막 값 병합 처리
            if (prev != null && cols.size() - 1 > startCol) {
                sheet.addMergedRegion(new CellRangeAddress(rowIndex, rowIndex, startCol, cols.size() - 1));
            }
        }

        // 4. 열 자동 너비 조정
        for (int i = 0; i < headerList.get(0).size(); i++) {
            sheet.autoSizeColumn(i);
        }

        // 5. 엑셀 파일을 바이트 배열로 변환
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();
        String fileName = data.get("tableId").toString() + ".xlsx";

        // 6. ResponseEntity 로 파일 다운로드 반환
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+fileName);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    private static void supiData(List<Map<String, Object>> list, String supi, int cellSize ) {
        list.stream()
                .filter(map -> map.get("headerId").toString().equals(supi))
                .findAny()
                .ifPresent(map -> {
                    int tmp = Integer.parseInt(map.getOrDefault("cellSize", 0).toString());

                    map.put("cellSize", tmp + cellSize);

                    if(map.get("supiHeader") != null) {
                        String newSupi = map.get("supiHeader").toString();

                        if (!newSupi.isEmpty()) {
                            supiData(list, newSupi, cellSize);
                        }
                    }
                });
    }

    private static List<List<String>> headerDataInit(List<Map<String, Object>> result) {
        int deptMax = result.stream()
                .map(r -> Integer.parseInt(r.get("dept").toString()))
                .max(Integer::compareTo)
                .orElse(0);

        List<List<String>> headerList = new ArrayList<>();

        while (headerList.size() <= deptMax) {
            headerList.add(new ArrayList<>()); // 자리 채우기
        }

        for(Map<String, Object> header : result) {
            int cellSize = Integer.parseInt(header.get("cellSize").toString());
            int dept = Integer.parseInt(header.get("dept").toString());

            for(int i = 0; i < cellSize; i++) {
                headerList.get(dept).add(header.get("headerName").toString());
            }
        }

        return headerList;
    }

    private static List<Map<String, Object>> sortTreePostOrder(List<Map<String, Object>> data) {
        List<Map<String, Object>> result = new ArrayList<>();
        Map<String, Map<String, Object>> idMap = new HashMap<>();

        for(Map<String, Object> map : data) {
            if(map == null) continue;
            map.put("children", new ArrayList<Map<String, Object>>());
            idMap.put((String) map.get("headerId"), map);
        }

        for (Map<String, Object> node : data) {
            if(node == null) continue;
            node.put("selected", false);
            String supi = Objects.toString(node.get("supiHeader"), null);
            if(supi == null || supi.isEmpty()) {
                result.add(node);
                continue;
            }

            Map<String, Object> parent = idMap.get(supi);
            if(parent != null) {
                List<Map<String, Object>> children = (List<Map<String, Object>>) parent.get("children");
                children.add(node);
            }
        }

        return result;
    }

    @Override
    public List<Map<String, Object>> selectDynamicTable(Map<String, Object> data) {
        List<Map<String, Object>> colList = kjoApiMapper.selectFieldTable(data);
        StringBuilder sb = new StringBuilder("select seq,\n");

        for (Map<String, Object> col : colList) {
            if(col.get("colType").equals("6")) {
                sb.append("cast("); sb.append(col.get("colName")); sb.append(" AS UNSIGNED)"); sb.append(" as ");
            } else {
                sb.append(col.get("colName"));  sb.append(" as ");
            }
            sb.append(col.get("colId"));    sb.append(",");
        }

        sb.append("false as selected");
        sb.append(" from ");  sb.append(data.get("tableId"));

        return kjoApiMapper.selectDynamicTable(sb.toString());
    }

    @Override
    @Transactional
    public ResponseEntity<?> modifyDynamicTable(Map<String, Object> data) {
        List<Map<String, Object>> colList = kjoApiMapper.selectFieldTable(data);

        List<Map<String, Object>> added = (List<Map<String, Object>>) data.get("added");
        List<Map<String, Object>> edited = (List<Map<String, Object>>) data.get("edited");
        List<Map<String, Object>> removed = (List<Map<String, Object>>) data.get("removed");

        String tableId = data.get("tableId").toString();

        if(added != null && !added.isEmpty())
            insertDynamicTable(tableId, added, colList);

        if(edited != null && !edited.isEmpty())
            updateDynamicTable(tableId, edited, colList);

        if(removed != null && !removed.isEmpty())
            deleteDynamicTable(tableId, removed);

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<?> excelUpload(MultipartFile file, Map<String, Object> tableInfo) {
        String fileName = file.getOriginalFilename();
        String tableId = tableInfo.get("tableId").toString();

        List<String> header = new ArrayList<>();
        List<Map<String, Object>> body = new ArrayList<>();

        if(!fileName.contains(tableId)) {
            return ResponseEntity.ok("001");
        }

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            // 첫 번째 시트 읽기
            Sheet sheet = workbook.getSheetAt(0);

            // 첫 번쨰 row 읽기 (헤더)
            Row headerRow = sheet.getRow(0);

            for(Cell cell : headerRow) {
                String value = getCellValue(cell);
                header.add(value);
            }

            for(int i = 1; i <= sheet.getLastRowNum(); i++) {
                Map<String, Object> tmpMap = new HashMap<>();
                Row row = sheet.getRow(i);
                for (int j = 0; j < header.size(); j++) {
                    Cell cell = row.getCell(j);

                    String value = getCellValue(cell);

                    tmpMap.put(header.get(j), value);
                }
                body.add(new HashMap<>(tmpMap));
            }

            insertExcelData(body, tableInfo);

            return ResponseEntity.ok("엑셀 업로드 성공");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("엑셀 업로드 실패: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<?> excelDown(Map<String, Object> data) throws IOException {
        List<Map<String, Object>> header = selectGridHeaderTable(data);
        List<Map<String, Object>> body = selectDynamicTableBody(data);

        header.sort(Comparator.comparing(x -> x.get("sortSn").toString()));

        List<List<String>> headerList = headerDataInit(header);

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Header");

        // 스타일 정의 (중앙정렬 + 테두리)
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        int rowNum = 0;

        // 3. 헤더 생성 및 병합
        for(List<String> headers : headerList) {
            Row row = sheet.createRow(rowNum++);

            String prev = null;
            int startCol = 0;

            for (int colIndex = 0; colIndex < headers.size(); colIndex++) {
                String value = headers.get(colIndex);

                // 값이 달라질 때 병합 처리
                if (prev != null && !prev.equals(value)) {
                    if (colIndex - 1 > startCol) {
                        sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, startCol, colIndex - 1));
                    }
                    startCol = colIndex;
                }

                // 셀 생성
                Cell cell = row.createCell(colIndex);
                cell.setCellValue(value);
                cell.setCellStyle(headerStyle);

                prev = value;
            }

            // 마지막 값 병합 처리
            if (prev != null && headers.size() - 1 > startCol) {
                sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, startCol, headers.size() - 1));
            }
        }

        List<String> headerNm = headerList.get(headerList.size()-1);

        for (Map<String, Object> cols : body) {
            Row row = sheet.createRow(rowNum++);

            for (int i = 0; i < headerNm.size(); i++) {
                String value = cols.get(headerNm.get(i)).toString();
                Cell cell = row.createCell(i);
                cell.setCellValue(value);
                cell.setCellStyle(headerStyle);
            }
        }

        // 4. 열 자동 너비 조정
        for (int i = 0; i < headerList.get(0).size(); i++) {
            sheet.autoSizeColumn(i);
        }

        // 5. 엑셀 파일을 바이트 배열로 변환
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        workbook.write(bos);
        workbook.close();

        byte[] excelBytes = bos.toByteArray();

        String fileName = data.get("tableId").toString() + "_data.xlsx";
        // 6. ResponseEntity 로 파일 다운로드 반환
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+fileName);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    @Transactional
    private void insertDynamicTable(String tableId, List<Map<String, Object>> added, List<Map<String, Object>> colList) {
        StringBuilder sb;

        for(Map<String, Object> add : added) {
            sb = new StringBuilder();
            StringBuilder colId = new StringBuilder();
            StringBuilder value = new StringBuilder();

            sb.append("insert into "); sb.append(tableId); sb.append("\n");
            for(String key : add.keySet()) {
                if(key.equals("selected")) continue;

                Map<String, Object> map = colList.stream().filter(d -> d.get("colId").equals(key)).findFirst().orElse(null);
                if(map == null || map.isEmpty()) return;
                colId.append(map.get("colName")); colId.append(" ,");

                value.append("'");
                if(add.get(key).toString().equals("true") || add.get(key).toString().equals("false"))
                    value.append(add.get(key).toString().equals("true") ? 1 : 0);
                else if(isValidDate(add.get(key).toString())) {
                    String date = add.get(key).toString().split("T")[0];
                    value.append(LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd")));
                } else
                    value.append(add.get(key));
                value.append("' ,");
            }
            colId.deleteCharAt(colId.length()-1);
            value.deleteCharAt(value.length()-1);

            sb.append("("); sb.append(colId); sb.append(")\n");
            sb.append("values\n");
            sb.append("("); sb.append(value); sb.append(")");

            kjoApiMapper.definitionMainTable(sb.toString());
        }
    }

    @Transactional
    private void updateDynamicTable(String tableId, List<Map<String, Object>> edited, List<Map<String, Object>> colList) {
        StringBuilder sb;

        for(Map<String, Object> edit : edited) {
            sb = new StringBuilder();
            sb.append("update "); sb.append(tableId); sb.append("\n");
            sb.append("set ");

            for (String key : edit.keySet()) {
                String value;

                if(key.equals("selected") || key.equals("seq")) continue;

                Map<String, Object> map = colList.stream().filter(d -> d.get("colId").equals(key)).findFirst().orElse(null);

                if(map == null || map.isEmpty()) return;

                if(edit.get(key).toString().equals("true") || edit.get(key).toString().equals("false"))
                    value = edit.get(key).toString().equals("true") ? "1" : "0";
                else if(isValidDate(edit.get(key).toString())) {
                    value = edit.get(key).toString().split("T")[0];
                    value = LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd")).toString();
                } else
                    value = edit.get(key).toString();

                sb.append(map.get("colName")); sb.append(" = '"); sb.append(value); sb.append("',\n");
            }
            sb.deleteCharAt(sb.length()-1);
            sb.deleteCharAt(sb.length()-1);
            sb.append("\nwhere seq = '"); sb.append(edit.get("seq")); sb.append("'");

            kjoApiMapper.definitionMainTable(sb.toString());
        }
    }

    @Transactional
    private void deleteDynamicTable(String tableId, List<Map<String, Object>> removed) {
        StringBuilder sb;

        for (Map<String, Object> remove : removed) {
            sb = new StringBuilder();

            sb.append("delete from "); sb.append(tableId); sb.append("\n");
            sb.append("where seq = '"); sb.append(remove.get("seq")); sb.append("'");

            kjoApiMapper.definitionMainTable(sb.toString());
        }
    }

    private static boolean isValidDate(String value) {
        try {
            LocalDate.parse(value.split("T")[0], DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString(); // yyyy-MM-dd
                }
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }

    private void insertExcelData(List<Map<String, Object>> body, Map<String, Object> tableInfo) {
        String tableId = tableInfo.get("tableId").toString();

        List<Map<String, Object>> colNames = kjoApiMapper.selectColName(tableInfo);

        for(Map<String, Object> map : body) {
            StringBuilder sb = new StringBuilder();
            StringBuilder col = new StringBuilder();
            StringBuilder value = new StringBuilder();

            sb.append("insert into "); sb.append(tableId); sb.append("\n");

            for (String key : map.keySet()) {
                Map<String, Object> colMap = colNames.stream().filter(d -> d.get("headerName").equals(key)).findAny().orElse(null);
                if(colMap == null || colMap.isEmpty()) return;

                col.append(colMap.get("colName")); col.append(",");
                value.append("'"); value.append(map.get(key)); value.append("',");
            }
            col.deleteCharAt(col.length()-1);
            value.deleteCharAt(value.length()-1);

            sb.append("("); sb.append(col); sb.append(")\n");
            sb.append("values \n");
            sb.append("("); sb.append(value); sb.append(")");

            kjoApiMapper.definitionMainTable(sb.toString());
        }
    }

    private List<Map<String, Object>> selectDynamicTableBody(Map<String, Object> data) {
        List<Map<String, Object>> colList = kjoApiMapper.selectFieldTable(data);
        List<Map<String, Object>> maps = kjoApiMapper.selectColName(data);

        StringBuilder sb = new StringBuilder("select seq,\n");

        for (Map<String, Object> col : colList) {
            if(col.get("colType").equals("6")) {
                sb.append("cast("); sb.append(col.get("colName")); sb.append(" AS UNSIGNED)");
            } else {
                sb.append(col.get("colName"));
            }
            Map<String, Object> map = maps.stream()
                    .filter(d -> d.get("colName").equals(col.get("colName")))
                    .findAny().orElse(null);
            if(map == null || map.isEmpty()) continue;

            sb.append(" as '"); sb.append(map.get("headerName"));
            sb.append("',");
        }

        sb.deleteCharAt(sb.length()-1);

        sb.append(" from ");  sb.append(data.get("tableId"));

        return kjoApiMapper.selectDynamicTable(sb.toString());
    }
}