import apiClient from "./apiClient";
import { API_CONFIG, buildUrl } from "@/config/api";

export const getAllOrderDetails = () =>
  apiClient.get(API_CONFIG.ENDPOINTS.ORDER_ITEMS.LIST);

export const createOrderDetail = (data: any) =>
  apiClient.post(API_CONFIG.ENDPOINTS.ORDER_ITEMS.CREATE, data);

export const updateOrderDetail = (id: number, data: any) =>
  apiClient.put(buildUrl(API_CONFIG.ENDPOINTS.ORDER_ITEMS.UPDATE, { id }), data);

export const deleteOrderDetail = (id: number) =>
  apiClient.delete(buildUrl(API_CONFIG.ENDPOINTS.ORDER_ITEMS.DELETE, { id }));
