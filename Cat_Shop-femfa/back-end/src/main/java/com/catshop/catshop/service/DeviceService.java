package com.catshop.catshop.service;

import com.catshop.catshop.entity.TrustedDevice;

public interface DeviceService {
    boolean isTrusted(String email, String deviceId);
    void markTrusted(String email, String deviceId, String ip, String agent);
}
