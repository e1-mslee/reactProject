package com.e1.backend.Controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.e1.backend.auth.TokenProvider;
import com.e1.backend.dto.UserDto;
import com.e1.backend.service.CustomUserDetailsService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final CustomUserDetailsService userSerivce;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto loginRequest, HttpServletResponse response ) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        String accessToken = tokenProvider.createToken(
            loginRequest.getUsername(),
            authentication.getAuthorities().iterator().next().getAuthority()
        );

        String refreshToken = tokenProvider.createRefreshToken(loginRequest.getUsername());
        // Refresh Token을 HttpOnly 쿠키에 저장
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)       // JS 접근 불가
                .secure(true)         // HTTPS에서만 전송
                .path("/")            // 모든 경로에서 전송
                .maxAge(7 * 24 * 60 * 60) // 14일
                .sameSite("Strict")   // CSRF 방지
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        // Access Token만 JSON으로 응답
        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserDto loginRequest) {
        userSerivce.signup(loginRequest);
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshTocken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String refreshToken = null;

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(Map.of("message", "Refresh Token이 유효하지 않습니다."));
    }

        String userId = tokenProvider.getUserPk(refreshToken);
        String role = tokenProvider.getRoleFromRefreshToken(refreshToken);
        String newAccessToken = tokenProvider.createToken(userId, role);


        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
}
