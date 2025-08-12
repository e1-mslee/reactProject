package com.e1.backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.e1.backend.service.ApiService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ApiController {
    
    private final ApiService apiService;

    @GetMapping("/api/commCode")
    @Operation(summary = "공통코드", description = "공통코드 리스트 가져오기.")
    public List<Map<String,Object>> getAllCode() {
        return apiService.getAllCode();
    }

    @GetMapping("/api/getMainTableInfo")
    @Operation(summary = "UDA 목록", description = "UDA 목록 테이블 정보 가져오기")
    public List<Map<String,Object>> getMainTableInfo(@RequestParam Map<String, Object> data) {
        log.info("data = {} ", data);
        return apiService.selectMainTableInfoList(data);
    }

    @PostMapping("/api/deleteMainTableInfo")
    @Operation(summary = "UDA 목록 삭제", description = "UDA 목록 삭제")
    public ResponseEntity<?>  deleteMainTableInfo(@RequestBody List<String> data) {
        apiService.deleteMainTableInfo(data);
        
        return ResponseEntity.ok().build();
    }


    @PostMapping("/api/saveMainTableInfo")
    @Operation(summary = "UDA 목록 저장", description = "UDA 목록 저장")
    public ResponseEntity<?>  saveMainTableInfo(@RequestBody List<Map<String,Object>> data) {
        apiService.saveMainTableInfo(data);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/getTableFieldList")
    @Operation(summary = "테이블 필드 리스트", description = "테이블 필드 리스트 가져오기")
    public List<Map<String,Object>> getTableFieldList(@RequestParam String tableSeq) {
        return apiService.getTableFieldList(tableSeq);
    }

    @PostMapping("/api/saveTableFieldList")
    @Operation(summary = "테이블 필드 저장", description = "테이블 필드 저장")
    public ResponseEntity<?>  saveTableFieldList(@RequestBody Map<String, Object> data) {
        apiService.saveTableFieldList(data);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/getMainTableInfoData")
    @Operation(summary = "테이블 정보 가져오기", description = "테이블 정보 가져오기")
    public List<Map<String, Object>> getMainTableInfoData(@RequestParam String tableSeq) {
        return apiService.getMainTableInfoData(tableSeq);
    }


    @GetMapping("/api/getHeaderList")
    @Operation(summary = "테이블 헤더 리스트", description = "테이블 헤더 리스트 가져오기")
    public List<Map<String,Object>> getHeaderList(@RequestParam String tableSeq) {
        return apiService.getHeaderList(tableSeq);
    }

    @PostMapping("/api/saveHeaderList")
    @Operation(summary = "테이블 헤더 저장", description = "테이블 헤더 저장")
    public ResponseEntity<?> saveHeaderList(@RequestBody List<Map<String,Object>> data) {
        apiService.saveHeaderList(data);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/tableValidationCheck")
    @Operation(summary = "테이블 데이터 카운트 체크", description = "테이블 데이터 카운트 체크")
    public Map<String,Object> tableValidationCheck(@RequestParam String tableSeq) {
        return apiService.tableValidationCheck(tableSeq);
    }
}
