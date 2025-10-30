import axiosClient from "./axiosClient";

const productApi = {
  // Lấy tất cả sản phẩm
  getAll: () => axiosClient.get("/customer/products"),

  // Lấy chi tiết sản phẩm theo ID
  getById: (id) => axiosClient.get(`/customer/products/${id}`),

  // Tìm kiếm theo từ khóa
  search: (keyword) => axiosClient.get(`/customer/products/search?keyword=${keyword}`),

  // Lọc theo loại sản phẩm
  filterByType: (typeId) => axiosClient.get(`/customer/products/type/${typeId}`),

  // Lọc theo danh mục
  filterByCategory: (categoryId) => axiosClient.get(`/customer/products/category/${categoryId}`),
};

export default productApi;
