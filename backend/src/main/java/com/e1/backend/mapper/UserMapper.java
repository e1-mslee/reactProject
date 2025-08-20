package com.e1.backend.mapper;

import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import com.e1.backend.dto.UserEntity;


@Mapper
public interface UserMapper {

    @Select("SELECT id as user_id, name as user_nm, password, role FROM user_info WHERE id = #{userId}")
    Optional<UserEntity> findByUserId(String userId);
    
}
