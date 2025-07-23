package com.e1.backend.serviceimpl;

import com.e1.backend.mapper.KjoApiMapper;
import com.e1.backend.service.KjoApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KjoApiServiceImpl implements KjoApiService {
    private final KjoApiMapper kjoApiMapper;

    @Override
    public List<Map<String, Object>> selectMainTable(Map<String, Object> data) {
        return kjoApiMapper.selectMainTable(data);
    }

    @Override
    @Transactional
    public ResponseEntity<?> insertMainTable(List<Map<String, Object>> data) {
        List<Map<String, Object>> insertData = data.stream().filter(map -> map.get("tableSeq") == null || map.get("tableSeq").equals("")).toList();
        List<Map<String, Object>> updateData = data.stream().filter(map -> map.get("tableSeq") != null && !map.get("tableSeq").equals("")).toList();

        if(!insertData.isEmpty())
            kjoApiMapper.insertMainTable(insertData);

        if(!updateData.isEmpty()) {
            for(Map<String, Object> map : updateData) {
                kjoApiMapper.updateMainTable(map);
            }
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<?> updateMainTable(Map<String, Object> data) {
        kjoApiMapper.updateMainTable(data);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<?> deleteMainTable(List<String> data) {
        kjoApiMapper.deleteMainTable(data);
        return ResponseEntity.ok().build();
    }

    @Override
    public List<Map<String, Object>> selectTableName(Map<String, Object> data) {
        return kjoApiMapper.selectTableName(data);
    }

    @Override
    public List<Map<String, Object>> selectFieldTable(Map<String, Object> data) {
        return kjoApiMapper.selectFieldTable(data);
    }

    @Override
    @Transactional
    public ResponseEntity<?> saveFieldTable(Map<String, List<Map<String, Object>>> data) {
        List<Map<String, Object>> added = data.get("added");
        List<Map<String, Object>> edited = data.get("edited");
        List<Map<String, Object>> removed = data.get("removed");

        if(!added.isEmpty())
            kjoApiMapper.insertFieldTable(added);

        if(!edited.isEmpty()) {
            for (Map<String, Object> map : edited) {
                kjoApiMapper.updateFieldTable(map);
            }
        }

        if(!removed.isEmpty()) {
            for(Map<String, Object> map : removed) {
                kjoApiMapper.deleteFieldTable(map);
            }
        }

        return ResponseEntity.ok().build();
    }
}
