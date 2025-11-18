package com.catshop.catshop.service.impl;

import com.catshop.catshop.entity.TrustedDevice;
import com.catshop.catshop.repository.TrustedDeviceRepository;
import com.catshop.catshop.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DeviceServiceImpl implements DeviceService {

    private final TrustedDeviceRepository trustedDeviceRepository;

    @Override
    public boolean isTrusted(String email, String deviceId) {
        String normalizedEmail = normalizeEmail(email);
        return trustedDeviceRepository.findByUserEmailAndDeviceId(normalizedEmail, deviceId)
                .map(TrustedDevice::isTrusted)
                .orElse(false);
    }

    @Override
    public void markTrusted(String email, String deviceId, String ip, String agent, String hostName) {
        String normalizedEmail = normalizeEmail(email);

        TrustedDevice device = trustedDeviceRepository.findByUserEmailAndDeviceId(normalizedEmail, deviceId)
                .orElse(TrustedDevice.builder()
                        .userEmail(normalizedEmail)
                        .deviceId(deviceId)
                        .ipAddress(ip)
                        .hostName(hostName)
                        .userAgent(agent)
                        .build());

        // Cập nhật lại IP / hostname / user-agent và thời gian đăng nhập mỗi lần
        device.setIpAddress(ip);
        device.setHostName(hostName);
        device.setUserAgent(agent);
        device.setTrusted(true);
        device.setLastLogin(LocalDateTime.now());
        trustedDeviceRepository.save(device);
    }

    @Override
    public List<TrustedDevice> getUserDevices(String email) {
        String normalizedEmail = normalizeEmail(email);
        return trustedDeviceRepository.findByUserEmailOrderByLastLoginDesc(normalizedEmail);
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
        String normalizedEmail = normalizeEmail(email);
        List<TrustedDevice> devices = trustedDeviceRepository.findByUserEmailOrderByLastLoginDesc(normalizedEmail);
        trustedDeviceRepository.deleteAll(devices);
    }

    /**
     * Chuẩn hóa email để tránh sai khác hoa/thường khi lưu và truy vấn thiết bị
     */
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
