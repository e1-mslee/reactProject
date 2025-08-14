package com.e1.backend.service;

import java.util.Map;

public interface AuthService {

    Map<String, String> selectLogin(String username, String password);
}
