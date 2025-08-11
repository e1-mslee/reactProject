package com.e1.backend.serviceimpl;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public void deleteMainTableInfo(List<String> data) {
       apiMapper.deleteMainTableInfo(data);
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
    
}
