package com.e1.backend.mapper;

import com.e1.backend.Dto.UserDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.Map;

@Mapper
public interface AuthMapper {

    Map<String, String> selectLogin(String username, String password);

    UserDto findByUsername(String username);

    void insertUser(Map<String, Object> data);

    Map<String, Object> selectRefreshToken(String userId);

    void insertRefreshToken(String userId, String refreshToken, String expiry);

    void deleteRefreshToken(String userId);

}
