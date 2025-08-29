package com.e1.backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/api/fetchDocDown/{tableSeq}")
    @Operation(summary = "문서양식 다운로드", description = "지정된 tableSeq의 문서양식을 다운로드한다.")
    public ResponseEntity<byte[]> fetchDocDown(@PathVariable String tableSeq) {
        try {
            // 1. 서비스에서 엑셀 생성
            byte[] excelFile = apiService.generateExcel(tableSeq);

            String fileName = "document_form_" + tableSeq + ".xlsx";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .header("Content-Type", 
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(excelFile);

        } catch (Exception e) {
            log.error("엑셀 생성 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/getTableDataList")
    @Operation(summary = "테이블 데이터 리스트", description = "테이블 데이터 리스트 가져오기")
    public List<Map<String,Object>> getTableDataList(@RequestParam String tableSeq) {
        return apiService.getTableDataList(tableSeq);
    }

}
