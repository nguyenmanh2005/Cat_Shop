package com.catshop.catshop.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaVerifyRequest {
    private String email;
    private int code;

}

