package com.e1.backend.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface KjoApiMapper {

    List<Map<String,Object>> selectMainTable(Map<String, Object> data);

    void insertMainTable(List<Map<String, Object>> data);

    void definitionMainTable(String query);

    void updateMainTable(Map<String, Object> data);

    void deleteMainTable(List<Map<String, Object>> data);

    Map<String, Object> selectTableName(Map<String, Object> data);

    List<Map<String, Object>> selectFieldTable(Map<String, Object> data);

    void insertFieldTable(List<Map<String, Object>> data);

    void updateFieldTable(Map<String, Object> data);

    void deleteFieldTable(Map<String, Object> data);

    List<Map<String, Object>> selectHeaderTable(Map<String, Object> data);

    void insertHeaderTable(List<Map<String, Object>> data);

    void updateHeaderTable(Map<String, Object> data);

    void deleteHeaderTable(Map<String, Object> data);

    List<Map<String, Object>> selectHeaderId(Map<String, Object> data);

    List<Map<String, Object>> selectGridHeaderTable(Map<String, Object> data);

    List<Map<String, Object>> selectColTypeCode();

    int selectDataCount(Map<String, Object> data);

    int findTable(Map<String, Object> data);
}
