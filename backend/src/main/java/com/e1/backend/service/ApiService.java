package com.e1.backend.service;


import java.util.List;
import java.util.Map;

public interface ApiService {
    List<Map<String, Object>> getAllCode();

    List<Map<String,Object>> selectMainTableInfoList();

    void deleteMainTableInfo(List<String> data);

    void saveMainTableInfo(List<Map<String,Object>> data);
}
