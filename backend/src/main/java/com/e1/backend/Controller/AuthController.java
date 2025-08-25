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

import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.RequestBody;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;
    private final CustomUserDetailsService userSerivce;

    @PostMapping("/login")
    @Operation(summary = "로그인 인증", description = "로그인 인증을 수행하고 JWT 토큰을 반환합니다.")
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
                .secure(true)           // HTTPS에서만 전송
                .path("/")                // 모든 경로에서 전송
                .maxAge(7 * 24 * 60 * 60)      // 7일
                .sameSite("Strict")   // CSRF 방지
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        userSerivce.saveRefreshToken(loginRequest.getUsername(), refreshToken);

        // Access Token만 JSON으로 응답
        return ResponseEntity.ok(Map.of(
            "accessToken", accessToken
        ));
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃  기능", description = "로그아웃 기능을 수행하고 쿠키를 삭제합니다.")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response ) {

        String token = tokenProvider.resolveToken(request);
        if (token == null || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
        }

        String userId = tokenProvider.getUserPk(token);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
        .httpOnly(true)
        .secure(true)
        .path("/")
        .maxAge(0) // 즉시 만료
        .sameSite("Strict")
        .build();

        response.addHeader("Set-Cookie", cookie.toString());
        
        userSerivce.deleteToken(userId);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/userDelete")
    @Operation(summary = "유저탈퇴", description = "유저탈퇴 기능을 수행하고 쿠키를 삭제합니다.")
    public ResponseEntity<?> userDelete(
        HttpServletRequest request,
        HttpServletResponse response ) {

        String token = tokenProvider.resolveToken(request);
        if (token == null || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
        }

        String userId = tokenProvider.getUserPk(token);

        log.info("회원탈퇴 요청: {}", userId);
        userSerivce.deleteUser(userId); // 회원탈퇴 서비스 호출

        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
        .httpOnly(true)
        .secure(true)
        .path("/")
        .maxAge(0) // 즉시 만료
        .sameSite("Strict")
        .build();

        response.addHeader("Set-Cookie", cookie.toString());

        userSerivce.deleteToken(userId);

        return ResponseEntity.ok().build();
    }


    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "회원가입을 수행합니다.")
    public ResponseEntity<?> signup(@RequestBody UserDto loginRequest) {
        userSerivce.signup(loginRequest);
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    @PostMapping("/passwordChange")
    @Operation(summary = "비밀번호 변경", description = "비밀번호를 변경합니다.")
    public ResponseEntity<?> passwordChange(HttpServletRequest request,@RequestBody Map<String, String> body) {
        
        String token = tokenProvider.resolveToken(request);
        if (token == null || !tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
        }

        String userId = tokenProvider.getUserPk(token);
        
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        boolean valid = userSerivce.checkPassword(userId, oldPassword);

        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "현재 비밀번호가 일치하지 않습니다."));
        }

        userSerivce.changePassword(userId, newPassword);


        return ResponseEntity.ok(Map.of("message", "패스워드 변경 성공"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "refresh 토큰 확인", description = "refresh 토큰을 확인하고 새로운 access token을 반환합니다.")
    public ResponseEntity<?> refreshTocken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String refreshToken = null;
        System.out.println("Refresh Token 확인 요청");
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        // refreshToken이 없는 경우
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Refresh Token이 없습니다."));
        }

        String userId = tokenProvider.getUserPk(refreshToken);
        boolean isValid = userSerivce.isValidToken(userId, refreshToken);

        if (isValid) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(Map.of("message", "Refresh Token이 유효하지 않습니다."));
        }

        String role = tokenProvider.getRoleFromRefreshToken(refreshToken);
        String newAccessToken = tokenProvider.createToken(userId, role);


        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }
}
