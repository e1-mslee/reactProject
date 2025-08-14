package com.e1.backend.Dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class TokenResponse {
    private String accessToken;

    public TokenResponse() {}
    public TokenResponse(String accessToken) { this.accessToken = accessToken; }
}
