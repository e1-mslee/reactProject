package com.e1.backend.Controller;

import com.e1.backend.Dto.LoginRequest;
import com.e1.backend.Dto.TokenResponse;
import com.e1.backend.service.AuthService;
import com.e1.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req, HttpServletResponse res) {
        Map<String,String> auth = authService.selectLogin(req.getUsername(), req.getPassword());
        String accessToken = jwtUtil.createJwt(auth.get("name"),  auth.get("role"));
        //String refreshToken = jwtUtil.generateRefreshToken(username);

        /*ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // production: true (HTTPS 필수)
                .path("/")
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());*/

        return ResponseEntity.ok(new TokenResponse(accessToken));
    }

    /*@PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken != null && jwtUtil.validateToken(refreshToken)) {
            String username = jwtUtil.getUsername(refreshToken);
            String newAccess = jwtUtil.generateAccessToken(username);
            return ResponseEntity.ok(new TokenResponse(newAccess));
        }
        return ResponseEntity.status(401).build();
    }*/

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofSeconds(0))
                .sameSite("Lax")
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }
}
