package com.catshop.catshop.service;

import com.catshop.catshop.entity.TrustedDevice;

import java.util.List;

public interface DeviceService {
    boolean isTrusted(String email, String deviceId);
    void markTrusted(String email, String deviceId, String ip, String agent);
    void updateLastLogin(String email, String deviceId, String ip, String agent);
    List<TrustedDevice> getUserDevices(String email);
    void removeDevice(String email, Long deviceId);
    void removeAllDevices(String email);
}
