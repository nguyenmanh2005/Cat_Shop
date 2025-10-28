package com.catshop.catshop.mapper;

import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "passwordHash", ignore = true) // Bỏ qua passwordHash, sẽ set thủ công
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "otpSecret", ignore = true)
    @Mapping(target = "orders", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    User FromUserRequestToUser(UserRequest request);

    List<UserResponse> FromUserToUserResponse (List<User> request);

    UserResponse FromUserToUserResponse(User user);
}

