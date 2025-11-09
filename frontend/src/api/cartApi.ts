import axiosClient from "./axiosClient";

export const cartApi = {
  // Lấy toàn bộ giỏ hàng theo user ID (endpoint chuẩn từ backend)
  getCartByUserId: (userId: number) =>
    axiosClient.get(`/orders/user/${userId}`),

  // Nếu backend có endpoint thêm vào giỏ hàng
addToCart: (userId: number, productId: number, quantity: number) =>
  axiosClient.post(`/orders/user/${userId}/add`, { productId, quantity }),

  // Nếu backend có endpoint xóa sản phẩm trong giỏ hàng
  removeFromCart: (userId: number, orderId: number) =>
    axiosClient.delete(`/orders/${orderId}/user/${userId}`),
};
