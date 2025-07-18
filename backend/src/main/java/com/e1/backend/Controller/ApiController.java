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

    @GetMapping("/api/getMainTableInfo")
    public List<Map<String,Object>> getMainTableInfo() {
        return apiService.selectMainTableInfoList();
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

}
