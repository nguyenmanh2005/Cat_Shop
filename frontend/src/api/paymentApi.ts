import apiClient from "./apiClient";
import { API_CONFIG } from "@/config/api";

export const getAllPayments = () =>
  apiClient.get(API_CONFIG.ENDPOINTS.PAYMENTS.LIST);

export const createPayment = (data: any) =>
  apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE, data);

export const updatePayment = (id: number, data: any) =>
  apiClient.put(`/payments/${id}`, data);

export const deletePayment = (id: number) =>
  apiClient.delete(`/payments/${id}`);
