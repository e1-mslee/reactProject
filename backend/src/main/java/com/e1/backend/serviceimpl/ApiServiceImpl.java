package com.e1.backend.serviceimpl;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.e1.backend.mapper.ApiMapper;
import com.e1.backend.service.ApiService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApiServiceImpl implements ApiService {

    private final ApiMapper apiMapper;
    
    @Override
    public List<Map<String, Object>> getAllCode() {
        return apiMapper.selectAllCode();
    }

    @Override
    public List<Map<String, Object>> selectMainTableInfoList() {
        return apiMapper.selectMainTableInfoList();
    }

    @Override
    public void deleteMainTableInfo(List<String> data) {
       apiMapper.deleteMainTableInfo(data);
    }
    
}
