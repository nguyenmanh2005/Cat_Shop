package com.catshop.catshop.entity;

public enum SecurityEventType {
    LOGIN_SUCCESS,
    LOGIN_FAILED,
    OTP_SENT,
    OTP_FAILED,
    OTP_VERIFIED,
    NEW_DEVICE_LOGIN,
    DEVICE_TRUSTED,
    DEVICE_REMOVED,
    SAFE_MODE_ENABLED,
    SAFE_MODE_DISABLED
}

