package com.e1.backend.serviceimpl;

import com.e1.backend.Dto.CustomUserDetails;
import com.e1.backend.Dto.UserDto;
import com.e1.backend.mapper.AuthMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {
    private final AuthMapper authMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        UserDto userData = authMapper.findByUsername(username);
        if (userData != null) {
            return new CustomUserDetails(userData);
        }

        return null;
    }
}
