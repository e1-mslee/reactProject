package com.e1.backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.e1.backend.service.ApiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ApiController {
    
    private final ApiService apiService;

    @GetMapping("/api/commCode")
    public List<Map<String,Object>> getAllCode() {
        return apiService.getAllCode();
    }

    @PostMapping("/api/getMainTableInfo")
    public List<Map<String,Object>> getMainTableInfo(@RequestBody Map<String, Object> data) {
        System.out.println(data);
        return apiService.selectMainTableInfoList(data);
    }

    @PostMapping("/api/deleteMainTableInfo")
    public ResponseEntity<?>  deleteMainTableInfo(@RequestBody List<String> data) {
        apiService.deleteMainTableInfo(data);
        
        return ResponseEntity.ok().build();
    }


    @PostMapping("/api/saveMainTableInfo")
    public ResponseEntity<?>  saveMainTableInfo(@RequestBody List<Map<String,Object>> data) {
        apiService.saveMainTableInfo(data);
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/getTableFieldList")
    public List<Map<String,Object>> getTableFieldList(@RequestBody String tableSeq) {
        return apiService.getTableFieldList(tableSeq);
    }

    @PostMapping("/api/saveTableFieldList")
    public ResponseEntity<?>  saveTableFieldList(@RequestBody List<Map<String,Object>> data) {
        apiService.saveTableFieldList(data);
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/deleteTableField")
    public ResponseEntity<?>  deleteTableField(@RequestBody List<Map<String,Object>> data) {
        apiService.deleteTableField(data);
        
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/getMainTableInfoData")
    public List<Map<String, Object>> getMainTableInfoData(@RequestBody String tableSeq) {
        return apiService.getMainTableInfoData(tableSeq);
    }
}
