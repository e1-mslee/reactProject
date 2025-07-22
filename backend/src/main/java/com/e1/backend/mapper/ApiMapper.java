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

    int deleteTablefield(List<Map<String,Object>> data);

    List<Map<String, Object>> getMainTableInfoData(String tableSeq);
}
