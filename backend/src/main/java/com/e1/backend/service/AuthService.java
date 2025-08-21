package com.e1.backend.service;

import com.e1.backend.Dto.UserDto;

import java.util.Map;

public interface AuthService {

    Map<String, String> selectLogin(String username, String password);

    void signup(Map<String, Object> data);

    UserDto findByUsername(String userName);
}
