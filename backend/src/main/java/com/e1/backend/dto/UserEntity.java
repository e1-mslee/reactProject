package com.e1.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserEntity {
    private String userId;
    private String password;
    private String role;
}
