import FingerprintJS from "@fingerprintjs/fingerprintjs";

const DEVICE_ID_STORAGE_KEY = 'cat_shop_device_id';
const FINGERPRINT_CACHE_KEY = 'cat_shop_fingerprint_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 giờ

interface FingerprintCache {
  visitorId: string;
  timestamp: number;
}

/**
 * Lấy hoặc tạo device fingerprint sử dụng FingerprintJS
 * Sử dụng cache để tránh tính toán lại nhiều lần
 */
export const getOrCreateDeviceFingerprint = async (): Promise<string> => {
  // 1. Kiểm tra cache trước
  const cached = getCachedFingerprint();
  if (cached) {
    return cached;
  }

  // 2. Kiểm tra localStorage (fallback nếu FingerprintJS chưa load xong)
  const stored = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (stored) {
    return stored;
  }

  try {
    // 3. Load FingerprintJS và lấy visitorId
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const visitorId = result.visitorId;

    // 4. Lưu vào cache và localStorage
    cacheFingerprint(visitorId);
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, visitorId);

    return visitorId;
  } catch (error) {
    console.error("❌ Lỗi khi tạo device fingerprint:", error);
    
    // Fallback: dùng crypto.randomUUID nếu FingerprintJS fail
    const fallbackId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, fallbackId);
    return fallbackId;
  }
};

/**
 * Lấy device fingerprint đồng bộ (nếu đã có trong cache/localStorage)
 * Dùng cho các trường hợp cần deviceId ngay lập tức
 */
export const getDeviceFingerprintSync = (): string | null => {
  // Ưu tiên cache
  const cached = getCachedFingerprint();
  if (cached) {
    return cached;
  }

  // Fallback: localStorage
  return localStorage.getItem(DEVICE_ID_STORAGE_KEY);
};

/**
 * Lấy fingerprint từ cache (nếu còn hiệu lực)
 */
const getCachedFingerprint = (): string | null => {
  try {
    const cachedStr = sessionStorage.getItem(FINGERPRINT_CACHE_KEY);
    if (!cachedStr) return null;

    const cached: FingerprintCache = JSON.parse(cachedStr);
    const now = Date.now();

    // Kiểm tra cache còn hiệu lực không (24 giờ)
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.visitorId;
    }

    // Cache hết hạn, xóa đi
    sessionStorage.removeItem(FINGERPRINT_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

/**
 * Lưu fingerprint vào cache
 */
const cacheFingerprint = (visitorId: string): void => {
  try {
    const cache: FingerprintCache = {
      visitorId,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(FINGERPRINT_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("⚠️ Không thể lưu fingerprint vào cache:", error);
  }
};

/**
 * Xóa device fingerprint (dùng khi logout hoặc reset)
 */
export const clearDeviceFingerprint = (): void => {
  localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
  sessionStorage.removeItem(FINGERPRINT_CACHE_KEY);
};

