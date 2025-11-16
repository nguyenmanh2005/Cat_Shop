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
        try {
            return trustedDeviceRepository.findByUserEmailAndDeviceId(email, deviceId)
                    .map(device -> {
                        if (device == null) return false;
                        try {
                            return device.isTrusted() && device.isValid();
                        } catch (Exception e) {
                            // Nếu lỗi khi check isValid, coi như không trusted
                            return false;
                        }
                    })
                    .orElse(false);
        } catch (Exception e) {
            // Nếu lỗi database, coi như không trusted
            return false;
        }
    }

    @Override
    public void markTrusted(String email, String deviceId, String ip, String agent) {
        try {
            TrustedDevice device = trustedDeviceRepository.findByUserEmailAndDeviceId(email, deviceId)
                    .orElse(TrustedDevice.builder()
                            .userEmail(email)
                            .deviceId(deviceId)
                            .ipAddress(ip != null ? ip : "")
                            .userAgent(agent)
                            .trusted(true)
                            .lastLogin(LocalDateTime.now())
                            .build());

            device.setTrusted(true);
            device.setLastLogin(LocalDateTime.now());
            
            // Gia hạn thêm 30 ngày nếu device đã tồn tại, hoặc tạo mới với 30 ngày
            LocalDateTime expiresAt = LocalDateTime.now().plusDays(30);
            device.setExpiresAt(expiresAt);
            
            // Đảm bảo createdAt được set nếu là device mới
            if (device.getCreatedAt() == null) {
                device.setCreatedAt(LocalDateTime.now());
            }
            
            trustedDeviceRepository.save(device);
        } catch (Exception e) {
            // Log lỗi nhưng không throw để không chặn đăng nhập
            throw new RuntimeException("Failed to mark device as trusted: " + e.getMessage(), e);
        }
    }

    @Override
    public List<TrustedDevice> getUserDevices(String email) {
        // Chỉ trả về các device còn hiệu lực
        return trustedDeviceRepository.findByUserEmailOrderByLastLoginDesc(email)
                .stream()
                .filter(TrustedDevice::isValid)
                .toList();
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
