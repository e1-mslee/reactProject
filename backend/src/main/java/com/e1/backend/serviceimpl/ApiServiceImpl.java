package com.e1.backend.serviceimpl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.e1.backend.mapper.ApiMapper;
import com.e1.backend.service.ApiService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
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

        List<Map<String,Object>> countList = apiMapper.unionCountTableQuery(tableList);

        Map<String, Object> tableCountMap = countList.stream()
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
    public void saveTableFieldList(List<Map<String, Object>> data) {
        for (Map<String, Object> item : data) {
            if ("INS".equals(item.get("STATUS"))) {
               apiMapper.insertTableField(item);
            } else if("UPD".equals(item.get("STATUS"))) {
               apiMapper.updateTableField(item);
            }
        }
    }

    @Override
    public void deleteTableField(List<Map<String, Object>> data) {
        apiMapper.deleteTablefield(data);
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
    
}
