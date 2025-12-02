const FAVORITES_STORAGE_KEY = "cat_shop_favorites";

export const loadFavoriteIds = (): number[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "number") : [];
  } catch (error) {
    console.error("Không thể đọc danh sách yêu thích:", error);
    return [];
  }
};

export const saveFavoriteIds = (ids: number[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error("Không thể lưu danh sách yêu thích:", error);
  }
};

export const toggleFavoriteId = (ids: number[], productId: number): number[] => {
  const exists = ids.includes(productId);
  if (exists) {
    return ids.filter((id) => id !== productId);
  }
  return [...ids, productId];
};

export { FAVORITES_STORAGE_KEY };


