package com.e1.backend.serviceimpl;

import com.e1.backend.mapper.AuthMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RefreshTokenService {
    private final String PREFIX = "refresh:";

    private final AuthMapper authMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final Long refreshExp;

    public RefreshTokenService(AuthMapper authMapper, RedisTemplate<String, String> redisTemplate, @Value("${refresh-token-exp}") Long refreshExp) {
        this.authMapper = authMapper;
        this.redisTemplate = redisTemplate;
        this.refreshExp = refreshExp;
    }

    public void store(String userId, String refreshToken) {
        redisTemplate.opsForValue()
                .set(PREFIX + userId, refreshToken, refreshExp, TimeUnit.MILLISECONDS);

        long epochMillis = LocalDateTime.now()
                .plus(refreshExp, ChronoUnit.MILLIS)
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

        String expiry = Instant.ofEpochMilli(epochMillis)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime().toString();

        Map<String, Object> tokenMap = authMapper.selectRefreshToken(userId);
        String storeRefreshToken = "";

        if(tokenMap != null)
            storeRefreshToken = tokenMap.get("refreshToken").toString();


        if(!storeRefreshToken.equals(refreshToken))
            authMapper.insertRefreshToken(userId, refreshToken, expiry);
    }

    public boolean validate(String userId, String refreshToken) {
        // redis에서 먼저 확인
        String redisToken = redisTemplate.opsForValue().get(PREFIX + userId);

        if (redisToken != null) {
            log.info("find token from redis = {}", redisToken);
            log.info("refreshToken = {}", refreshToken);
            return redisToken.equals(refreshToken);
        }

        // redis에 없으면 DB 확인
        Map<String, Object> tokenMap = authMapper.selectRefreshToken(userId);
        if(tokenMap != null) return false;

        String storeRefreshToken = tokenMap.get("refreshToken").toString();
        // DB에 있으면 redis에 다시 캐싱
        if(refreshToken.equals(storeRefreshToken)) {
            log.info("find token from DB = {}", storeRefreshToken);
            log.info("refreshToken = {}", refreshToken);
            LocalDateTime expiryDate = LocalDateTime.parse(tokenMap.get("expiryDate").toString(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

            long ttl = expiryDate.atZone(java.time.ZoneId.systemDefault())
                    .toEpochSecond() - System.currentTimeMillis() / 1000;

            if (ttl > 0) {
                redisTemplate.opsForValue()
                        .set(PREFIX + userId, storeRefreshToken, ttl, TimeUnit.SECONDS);
                return true;
            }
        }

        return false;
    }

    public void remove(String userId) {
        redisTemplate.delete(PREFIX + userId);
        authMapper.deleteRefreshToken(userId);
    }
}