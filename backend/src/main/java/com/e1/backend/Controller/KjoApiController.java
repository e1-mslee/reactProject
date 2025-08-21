package com.e1.backend.Controller;

import com.e1.backend.service.KjoApiService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/kjoApi")
@RequiredArgsConstructor
public class KjoApiController {
    private final KjoApiService kjoApiService;

    @GetMapping("/mainTable")
    @Operation(summary = "UDA 목록 조회", description = "UDA 목록 조회")
    public List<Map<String, Object>> selectMainTable(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectMainTable(data);
    }

    @PostMapping("/mainTable")
    @Operation(summary = "UDA 목록 추가", description = "UDA 목록 추가")
    public ResponseEntity<?> insertMainTable(@RequestBody List<Map<String, Object>> data) {
        return kjoApiService.insertMainTable(data);
    }

    @PutMapping("/mainTable")
    @Operation(summary = "UDA 목록 수정", description = "UDA 목록 수정")
    public ResponseEntity<?> updateMainData(@RequestBody Map<String, Object> data) {
        return kjoApiService.updateMainTable(data);
    }

    @PostMapping("/deleteMainTable")
    @Operation(summary = "UDA 목록 삭제", description = "UDA 목록 삭제")
    public ResponseEntity<?> deleteMainTable(@RequestBody List<Map<String, Object>> data) {
        return kjoApiService.deleteMainTable(data);
    }

    @GetMapping("/tableName")
    @Operation(summary = "UDA 목록 정보 조회", description = "UDA 목록 정보 조회")
    public Map<String, Object> selectTableName(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectTableName(data);
    }

    @GetMapping("/fieldTable")
    @Operation(summary = "테이블 필드 조회", description = "테이블 필드 조회")
    public List<Map<String, Object>> selectFieldTable(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectFieldTable(data);
    }

    @PostMapping("/fieldTable")
    @Operation(summary = "테이블 필드 저장", description = "테이블 필드 저장")
    public ResponseEntity<?> saveFieldTable(@RequestBody Map<String, Object> data) {
        return kjoApiService.saveFieldTable(data);
    }

    @GetMapping("/headerTable")
    @Operation(summary = "테이블 헤더 조회", description = "테이블 헤더 조회")
    public List<Map<String, Object>> selectHeaderTable(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectHeaderTable(data);
    }

    @PostMapping("headerTable")
    @Operation(summary = "테이블 헤더 저장", description = "테이블 헤더 저장")
    public ResponseEntity<?> saveHeaderTable(@RequestBody Map<String, List<Map<String, Object>>> data) {
        return kjoApiService.saveHeaderTable(data);
    }

    @GetMapping("/headerId")
    @Operation(summary = "테이블 헤더 ID,명 조회", description = "테이블 헤더 ID,명 조회")
    public List<Map<String, Object>> selectHeaderId(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectHeaderId(data);
    }

    @GetMapping("/gridHeaderTable")
    @Operation(summary = "테이블 헤더 명(미리보기) 조회", description = "테이블 헤더 명(미리보기) 조회")
    public List<Map<String, Object>> selectGridHeaderTable(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectGridHeaderTable(data);
    }

    @PostMapping("/createTable")
    @Operation(summary = "테이블 생성", description = "물리 테이블 생성")
    public ResponseEntity<?> createTable(@RequestBody Map<String, Object> data) {
        return kjoApiService.createTable(data);
    }

    @PostMapping("/initTable")
    @Operation(summary = "테이블 초기화", description = "테이블 데이터 초기화")
    public ResponseEntity<?> initTable(@RequestBody Map<String, Object> data) {
        return kjoApiService.initTable(data);
    }

}
