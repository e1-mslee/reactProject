package com.e1.backend.service;


import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartRequest;

public interface ApiService {
    List<Map<String, Object>> getAllCode();

    List<Map<String,Object>> selectMainTableInfoList(Map<String, Object> data);

    void deleteMainTableInfo(List<String> data);

    void saveMainTableInfo(List<Map<String,Object>> data);

    List<Map<String,Object>> getTableFieldList(String tableSeq);

    void saveTableFieldList(Map<String,Object> data);

    List<Map<String, Object>> getMainTableInfoData(String tableSeq);

    List<Map<String,Object>> getHeaderList(String tableSeq);

    void saveHeaderList(List<Map<String,Object>> data);

    Map<String,Object> tableValidationCheck (String tableSeq);

    public byte[] generateExcel (String tableSeq)  throws Exception ;

    List<Map<String,Object>> getTableDataList(String tableSeq);

    void excelUpload(MultipartFile file, String tableSeq);

}
