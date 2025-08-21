package com.e1.backend.mapper;

import java.util.Optional;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import com.e1.backend.dto.UserDto;
import com.e1.backend.dto.UserEntity;


@Mapper
public interface UserMapper {

    @Select("SELECT id as user_id, name as user_nm, password, role FROM user_info WHERE id = #{userId}")
    Optional<UserEntity> findByUserId(String userId);


    @Insert("""
        INSERT INTO user_info (id, password, role, email, name)
        VALUES (#{username}, #{password}, '1', #{email}, #{name})
    """)
    void signup(UserDto loginRequest);

    @Delete("""
        DELETE FROM user_info WHERE id = #{userId}
    """)
    void deleteUser(String userId);
}
