package com.catshop.catshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    @com.fasterxml.jackson.annotation.JsonProperty("access_token")
    private String accessToken;

    @com.fasterxml.jackson.annotation.JsonProperty("refresh_token")
    private String refreshToken;

    @com.fasterxml.jackson.annotation.JsonProperty("expires_in")
    private Long expiresIn;

    private AuthUserResponse user;
}



