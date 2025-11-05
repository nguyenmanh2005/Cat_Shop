package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "password", target = "passwordHash")
    User FromUserRequestToUser(UserRequest request);

    List<UserResponse> FromUserToUserResponse (List<User> request);

    @Mapping(source = "userId", target = "user_id")
    @Mapping(source = "role.roleId", target = "role_id")
    UserResponse FromUserToUserResponse(User user);
}

