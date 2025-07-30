package com.e1.backend.service;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

public interface KjoApiService {

    List<Map<String, Object>> selectMainTable(Map<String, Object> data);

    ResponseEntity<?> insertMainTable(List<Map<String, Object>> data);

    ResponseEntity<?> updateMainTable(Map<String, Object> data);

    ResponseEntity<?> deleteMainTable(List<String> data);

    List<Map<String, Object>> selectTableName(Map<String, Object> data);

    List<Map<String, Object>> selectFieldTable(Map<String, Object> data);

    ResponseEntity<?> saveFieldTable(Map<String, List<Map<String, Object>>> data);

    List<Map<String, Object>> selectHeaderTable(Map<String, Object> data);

    ResponseEntity<?> saveHeaderTable(Map<String, List<Map<String, Object>>> data);

    List<Map<String, Object>> selectHeaderId(Map<String, Object> data);

    List<Map<String, Object>> selectGridHeaderTable(Map<String, Object> data);
}
