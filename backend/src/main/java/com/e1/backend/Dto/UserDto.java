package com.e1.backend.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDto {
    private String userId;
    private String password;
    private String userName;
    private String email;
    private String role;
}
