package com.e1.backend.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ApiMapper {
    List<Map<String,Object>> selectAllCode();

    List<Map<String,Object>> selectMainTableInfoList(Map<String, Object> data);

    int deleteMainTableInfo(List<String> data);

    int insertMainTableInfo(Map<String, Object> data);

    int updateMainTableInfo(Map<String, Object> data);

    List<Map<String,Object>> unionCountTableQuery(List<String> dataList);

    Map<String,Object> unionCountTableQueryExcute(List<String> dataList);

    List<Map<String,Object>> selectMainTableIdList(Map<String, Object> data);

    List<Map<String,Object>> selectFieldList(String tableSeq);

    int insertTableField(Map<String, Object> data);

    int updateTableField(Map<String, Object> data);

    int deleteTablefield(Map<String, Object> data);

    List<Map<String, Object>> getMainTableInfoData(String tableSeq);

    List<Map<String, Object>> getHeaderList(String tableSeq);
    
    void insertHeaderList(Map<String, Object> data);

    void updateHeaderList(Map<String, Object> data);

    void deleteHeaderList(Map<String, Object> data);

    void createTable(String query);

    String tableCreateCheck(String tableSeq);

    String tableexistCheck(String tableSeq);

    void dropTable(String tableName);

    int tableCountInfo(String tableName);

    void removeTablefield(List<String> data);

    void removeTableHeader(List<String> data);

    List<Map<String, Object>> tableDataList(String tableName);

    List<Map<String, Object>> changeFiledNm(String tableSeq);

    void deleteDataTable(String tableName);

    void insertDataTable(String sql);

    void addTableData(String sql);

}
