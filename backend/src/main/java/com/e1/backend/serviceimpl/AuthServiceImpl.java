package com.e1.backend.serviceimpl;

import com.e1.backend.mapper.AuthMapper;
import com.e1.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AuthMapper authMapper;

    @Override
    public Map<String, String> selectLogin(String username, String password) {
        Map<String, String> auth = authMapper.selectLogin(username, password);

        if(auth != null){
            return auth;
        }

        throw new RuntimeException("Invaild credentials");
    }
}
