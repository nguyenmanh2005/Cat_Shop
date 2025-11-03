// 📁 src/api/orderApi.ts
import apiClient from "./apiClient";
import { API_CONFIG, buildUrl } from "@/config/api";

// -------------------- ORDERS --------------------
export const orderApi = {
  getAll: async () => {
    const res = await apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.LIST);
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get(buildUrl(API_CONFIG.ENDPOINTS.ORDERS.DETAIL, { id }));
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.CREATE, data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put(buildUrl(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, { id }), data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(buildUrl(API_CONFIG.ENDPOINTS.ORDERS.DELETE, { id }));
    return res.data;
  },
};

// -------------------- ORDER DETAILS --------------------
export const orderDetailApi = {
  getAll: async () => {
    const res = await apiClient.get(API_CONFIG.ENDPOINTS.ORDER_ITEMS.LIST);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post(API_CONFIG.ENDPOINTS.ORDER_ITEMS.CREATE, data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put(buildUrl(API_CONFIG.ENDPOINTS.ORDER_ITEMS.UPDATE, { id }), data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(buildUrl(API_CONFIG.ENDPOINTS.ORDER_ITEMS.DELETE, { id }));
    return res.data;
  },
};

// -------------------- PAYMENTS --------------------
export const paymentApi = {
  getAll: async () => {
    const res = await apiClient.get("/payments");
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get(`/payments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/payments", data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put(`/payments/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/payments/${id}`);
    return res.data;
  },
};

// -------------------- SHIPMENTS --------------------
export const shipmentApi = {
  getAll: async () => {
    const res = await apiClient.get("/shipments");
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get(`/shipments/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/shipments", data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await apiClient.put(`/shipments/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/shipments/${id}`);
    return res.data;
  },
};

// ✅ Thêm dòng này ở cuối file để fix lỗi import default
export default { orderApi, orderDetailApi, paymentApi, shipmentApi };
