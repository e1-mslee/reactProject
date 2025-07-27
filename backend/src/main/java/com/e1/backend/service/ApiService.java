package com.e1.backend.service;


import java.util.List;
import java.util.Map;

public interface ApiService {
    List<Map<String, Object>> getAllCode();

    List<Map<String,Object>> selectMainTableInfoList(Map<String, Object> data);

    void deleteMainTableInfo(List<String> data);

    void saveMainTableInfo(List<Map<String,Object>> data);

    List<Map<String,Object>> getTableFieldList(String tableSeq);

    void saveTableFieldList(List<Map<String,Object>> data);

    void deleteTableField(List<Map<String,Object>> data);

    List<Map<String, Object>> getMainTableInfoData(String tableSeq);

    List<Map<String,Object>> getHeaderList(String tableSeq);

    void saveHeaderList(List<Map<String,Object>> data);
}
