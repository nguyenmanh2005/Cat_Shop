import apiClient from "./apiClient";
import { API_CONFIG } from "@/config/api";

export const getAllShipments = () =>
  apiClient.get(API_CONFIG.ENDPOINTS.SHIPMENTS.LIST);

export const createShipment = (data: any) =>
  apiClient.post(API_CONFIG.ENDPOINTS.SHIPMENTS.CREATE, data);

export const updateShipment = (id: number, data: any) =>
  apiClient.put(`/shipments/${id}`, data);

export const deleteShipment = (id: number) =>
  apiClient.delete(`/shipments/${id}`);
