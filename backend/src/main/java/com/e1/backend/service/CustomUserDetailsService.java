package com.e1.backend.service;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.e1.backend.dto.CustomUserDetails;
import com.e1.backend.dto.UserEntity;
import com.e1.backend.mapper.UserMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserMapper userMapper;

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
                    .USER_PASSWORD("{noop}" + user.getPassword()) // <- {noop} 붙이기
                    .role(List.of(new SimpleGrantedAuthority(authority))) // 변환된 문자열 권한 사용
                    .build();
    }
}
