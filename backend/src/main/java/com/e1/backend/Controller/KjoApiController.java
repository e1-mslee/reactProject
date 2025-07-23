package com.e1.backend.Controller;

import com.e1.backend.service.KjoApiService;
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
    public List<Map<String, Object>> selectMainTable(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectMainTable(data);
    }

    @PostMapping("/mainTable")
    public ResponseEntity<?> insertMainTable(@RequestBody List<Map<String, Object>> data) {
        return kjoApiService.insertMainTable(data);
    }

    @PutMapping("/mainTable")
    public ResponseEntity<?> updateMainData(@RequestBody Map<String, Object> data) {
        return kjoApiService.updateMainTable(data);
    }

    @PostMapping("/deleteMainTable")
    public ResponseEntity<?> deleteMainTable(@RequestBody List<String> data) {
        return kjoApiService.deleteMainTable(data);
    }

    @GetMapping("/tableName")
    public List<Map<String, Object>> selectTableName(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectTableName(data);
    }

    @GetMapping("/fieldTable")
    public List<Map<String, Object>> selectFieldTable(@RequestParam Map<String, Object> data) {
        return kjoApiService.selectFieldTable(data);
    }

    @PostMapping("/fieldTable")
    public ResponseEntity<?> saveFieldTable(@RequestBody Map<String, List<Map<String, Object>>> data) {
        return kjoApiService.saveFieldTable(data);
    }

}
