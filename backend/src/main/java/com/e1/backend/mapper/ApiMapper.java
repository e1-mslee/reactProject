package com.e1.backend.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ApiMapper {
    List<Map<String,Object>> selectAllCode();

    List<Map<String,Object>> selectMainTableInfoList();

    int deleteMainTableInfo(List<String> data);
}
