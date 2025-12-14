// 🔧 Utility để sửa tên danh mục hiển thị
// Bạn có thể sửa tên ở đây để thay đổi cách hiển thị trên toàn bộ ứng dụng

/**
 * Mapping tên danh mục từ API sang tên hiển thị
 * Key: Tên từ API (tên trong database)
 * Value: Tên hiển thị (tên muốn hiện trên giao diện)
 */
const categoryNameMapping: Record<string, string> = {
  "Thức ăn cho mèo lowns": "Thức ăn cho mèo Royal Canin", // Sửa tên ở đây
  "Thức ăn cho mèo": "Thức ăn cho mèo chất lượng cao", // Sửa tên ở đây
  // Thêm các mapping khác nếu cần:
  // "Tên cũ": "Tên mới",
};

/**
 * Chuyển đổi tên danh mục từ API sang tên hiển thị
 * @param categoryName - Tên danh mục từ API
 * @returns Tên danh mục để hiển thị
 */
export const getCategoryDisplayName = (categoryName: string): string => {
  if (!categoryName) return "Không có tên";
  return categoryNameMapping[categoryName] || categoryName;
};

/**
 * Thêm hoặc cập nhật mapping cho tên danh mục
 * @param originalName - Tên gốc từ API
 * @param displayName - Tên muốn hiển thị
 */
export const setCategoryMapping = (originalName: string, displayName: string): void => {
  categoryNameMapping[originalName] = displayName;
};

