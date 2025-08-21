package com.e1.backend.service;

import java.time.Duration;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.e1.backend.dto.CustomUserDetails;
import com.e1.backend.dto.UserDto;
import com.e1.backend.dto.UserEntity;
import com.e1.backend.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, String> redisTemplate;
    private static final long REFRESH_TOKEN_EXPIRE_SEC = 7 * 24 * 60 * 60; // 7일

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity user = userMapper.findByUserId(username)
            .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없음"));

        String dbRole = user.getRole(); // "1" 또는 "2"
        String authority;
        switch (dbRole) {
            case "1": authority = "ROLE_USER"; break;
            case "2": authority = "ROLE_ADMIN"; break;
            default: authority = "ROLE_USER"; // 기본값
        }

        return CustomUserDetails.builder()
                    .USER_ID(user.getUserId())
                    .USER_PASSWORD(user.getPassword()) 
                    .role(List.of(new SimpleGrantedAuthority(authority))) // 변환된 문자열 권한 사용
                    .build();
    }

    @Transactional
    public void signup(UserDto loginRequest) {
        String encodedPassword = passwordEncoder.encode(loginRequest.getPassword());
        loginRequest.setPassword(encodedPassword);

        userMapper.signup(loginRequest);
    }

    @Transactional
    public void deleteUser(String userId) {
        userMapper.deleteUser(userId);
    }

    public boolean checkPassword(String userId, String rawPassword) {
        String encodedPassword = userMapper.findPasswordByUserId(userId); 
        if (encodedPassword == null) return false;
        System.out.println("Encoded Password: " + encodedPassword);
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public void changePassword(String userId, String newPassword) {
        String encodedNewPassword = passwordEncoder.encode(newPassword);
        userMapper.updatePassword(userId, encodedNewPassword);
    }

    // Redis에 토큰 저장
    public void saveRefreshToken(String userId, String refreshToken) {
        redisTemplate.opsForValue().set(userId, refreshToken, Duration.ofSeconds(REFRESH_TOKEN_EXPIRE_SEC));
    }

    // 토큰 검증
    public boolean isValidToken(String userId, String refreshToken) {
        String storedToken = redisTemplate.opsForValue().get(userId);
        return refreshToken.equals(storedToken);
    }

    // 로그아웃/탈퇴 시 토큰 삭제
    public void deleteToken(String userId) {
        redisTemplate.delete(userId);
    }
}
