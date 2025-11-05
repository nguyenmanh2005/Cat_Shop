package com.catshop.catshop.dto.response;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long user_id;
    private String username;
    private String email;
    private String phone;
    private String address;
    private Long role_id;
}
