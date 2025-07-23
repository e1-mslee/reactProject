package com.e1.backend.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface KjoApiMapper {

    List<Map<String,Object>> selectMainTable(Map<String, Object> data);

    void insertMainTable(List<Map<String, Object>> data);

    void updateMainTable(Map<String, Object> data);

    void deleteMainTable(List<String> data);

    List<Map<String, Object>> selectTableName(Map<String, Object> data);

    List<Map<String, Object>> selectFieldTable(Map<String, Object> data);

    void insertFieldTable(List<Map<String, Object>> data);

    void updateFieldTable(Map<String, Object> data);

    void deleteFieldTable(Map<String, Object> data);
}
