package com.e1.backend.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public interface KjoApiService {

    List<Map<String, Object>> selectMainTable(Map<String, Object> data);

    ResponseEntity<?> insertMainTable(List<Map<String, Object>> data);

    ResponseEntity<?> updateMainTable(Map<String, Object> data);

    ResponseEntity<?> deleteMainTable(List<Map<String, Object>> data);

    Map<String, Object> selectTableName(Map<String, Object> data);

    List<Map<String, Object>> selectFieldTable(Map<String, Object> data);

    ResponseEntity<?> saveFieldTable(Map<String, Object> data);

    List<Map<String, Object>> selectHeaderTable(Map<String, Object> data);

    ResponseEntity<?> saveHeaderTable(Map<String, List<Map<String, Object>>> data);

    List<Map<String, Object>> selectHeaderId(Map<String, Object> data);

    List<Map<String, Object>> selectGridHeaderTable(Map<String, Object> data);

    ResponseEntity<?> createTable(Map<String, Object> data);

    ResponseEntity<?> initTable(Map<String, Object> data);

    ResponseEntity<?> docDown(Map<String, Object> data) throws Exception;

    List<Map<String, Object>> selectDynamicTable(Map<String, Object> data);

    ResponseEntity<?> modifyDynamicTable(Map<String, Object> data);

    ResponseEntity<?> excelUpload(MultipartFile file, Map<String, Object> tableInfo);

    ResponseEntity<?> excelDown(Map<String, Object> data) throws IOException;
}
