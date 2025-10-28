package com.catshop.catshop.dto.response;

import com.catshop.catshop.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String phone;
    private String address;
    private Long roleId;
    private String roleName;
}

