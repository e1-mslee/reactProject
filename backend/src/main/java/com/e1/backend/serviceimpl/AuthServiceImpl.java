package com.e1.backend.serviceimpl;

import com.e1.backend.Dto.UserDto;
import com.e1.backend.mapper.AuthMapper;
import com.e1.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Map<String, String> selectLogin(String username, String password) {
        Map<String, String> auth = authMapper.selectLogin(username, password);

        if(auth != null){
            return auth;
        }

        throw new RuntimeException("Invaild credentials");
    }

    @Override
    public void signup(Map<String, Object> data) {
        log.info("data = {}", data);
        String encodedPassword = passwordEncoder.encode(data.get("password").toString());
        data.put("password", encodedPassword);
        int result = authMapper.insertUser(data);
    }

    public UserDto findByUsername(String userName) {
        return authMapper.findByUsername(userName);
    }
}
