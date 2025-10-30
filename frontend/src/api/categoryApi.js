import axiosClient from "./axiosClient";

const categoryApi = {
  getAllAdmin: () => axiosClient.get("/categories/admin"),
  getAllCustomer: () => axiosClient.get("/categories/customer"),
  getById: (id) => axiosClient.get(`/categories/${id}`),
  create: (data) => axiosClient.post("/categories/admin", data),
  update: (id, data) => axiosClient.put(`/categories/admin/${id}`, data),
  delete: (id) => axiosClient.delete(`/categories/admin/${id}`)
};

export default categoryApi;
