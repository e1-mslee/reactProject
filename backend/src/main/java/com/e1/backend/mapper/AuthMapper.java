package com.e1.backend.mapper;

import com.e1.backend.Dto.UserDto;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Map;

@Mapper
public interface AuthMapper {

    Map<String, String> selectLogin(String username, String password);

    UserDto findByUsername(String username);

    int insertUser(Map<String, Object> data);

    String selectRefreshToken(String userId);

    void insertRefreshToken(String userId, String refreshToken);

    void deleteRefreshToken(String userId);

}
