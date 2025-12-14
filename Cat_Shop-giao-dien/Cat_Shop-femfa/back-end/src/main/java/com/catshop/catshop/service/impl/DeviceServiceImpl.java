package com.catshop.catshop.service.impl;

import com.catshop.catshop.entity.TrustedDevice;
import com.catshop.catshop.repository.TrustedDeviceRepository;
import com.catshop.catshop.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    @Override
    public void updateLastLogin(String email, String deviceId, String ip, String agent) {
        TrustedDevice device = trustedDeviceRepository.findByUserEmailAndDeviceId(email, deviceId)
                .orElse(null);
        
        if (device != null) {
            // Cập nhật lastLogin và có thể cập nhật IP/UserAgent nếu thay đổi
            device.setLastLogin(LocalDateTime.now());
            if (ip != null && !ip.isEmpty()) {
                device.setIpAddress(ip);
            }
            if (agent != null && !agent.isEmpty()) {
                device.setUserAgent(agent);
            }
            trustedDeviceRepository.save(device);
        } else {
            // Nếu thiết bị chưa tồn tại, tạo mới và đánh dấu là trusted
            markTrusted(email, deviceId, ip, agent);
        }
    }

    @Override
    public List<TrustedDevice> getUserDevices(String email) {
        return trustedDeviceRepository.findByUserEmailOrderByLastLoginDesc(email);
    }

    @Override
    public void removeDevice(String email, Long deviceId) {
        TrustedDevice device = trustedDeviceRepository.findById(deviceId)
                .orElseThrow(() -> new com.catshop.catshop.exception.ResourceNotFoundException("Thiết bị không tồn tại"));
        
        if (!device.getUserEmail().equals(email)) {
            throw new com.catshop.catshop.exception.BadRequestException("Bạn không có quyền xóa thiết bị này");
        }
        
        trustedDeviceRepository.delete(device);
    }

    @Override
    public void removeAllDevices(String email) {
        List<TrustedDevice> devices = trustedDeviceRepository.findByUserEmailOrderByLastLoginDesc(email);
        trustedDeviceRepository.deleteAll(devices);
    }
}
