package com.catshop.catshop.service.impl;

import com.catshop.catshop.entity.TrustedDevice;
import com.catshop.catshop.repository.TrustedDeviceRepository;
import com.catshop.catshop.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final TrustedDeviceRepository trustedDeviceRepository;

    @Override
    public boolean isTrusted(String email, String deviceId) {
        return trustedDeviceRepository.findByUserEmailAndDeviceId(email, deviceId)
                .map(TrustedDevice::isTrusted)
                .orElse(false);
    }

    @Override
    public void markTrusted(String email, String deviceId, String ip, String agent) {
        TrustedDevice device = trustedDeviceRepository.findByUserEmailAndDeviceId(email, deviceId)
                .orElse(TrustedDevice.builder()
                        .userEmail(email)
                        .deviceId(deviceId)
                        .ipAddress(ip)
                        .userAgent(agent)
                        .build());

        device.setTrusted(true);
        device.setLastLogin(LocalDateTime.now());
        trustedDeviceRepository.save(device);
    }
}
