package com.e1.backend.serviceimpl;

import com.e1.backend.mapper.AuthMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final AuthMapper authMapper;

    public void store(String userId, String refreshToken) {
        String storeRefreshToken = authMapper.selectRefreshToken(userId);

        if(!storeRefreshToken.equals(refreshToken))
            authMapper.insertRefreshToken(userId, refreshToken);
    }

    public boolean validate(String userId, String refreshToken) {
        String storeRefreshToken = authMapper.selectRefreshToken(userId);
        return refreshToken.equals(storeRefreshToken);
    }

    public void remove(String userId) {
        authMapper.deleteRefreshToken(userId);
    }
}