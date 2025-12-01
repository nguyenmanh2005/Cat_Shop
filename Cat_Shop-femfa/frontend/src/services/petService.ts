import { apiService } from "./api";
import { API_CONFIG, buildUrl } from "@/config/api";
import type { Product } from "@/types";
export interface PetRecord {
  productId?: number;
  productName?: string;
  price?: number;
  stockQuantity?: number;
  imageUrl?: string;
  description?: string;
  breed?: string;
  age?: number;
  gender?: string;
  vaccinated?: boolean;
  product?: Product;
}

const extractRecords = (payload: unknown): PetRecord[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { content?: unknown[] }).content)
  ) {
    return (payload as { content: PetRecord[] }).content;
  }

  return [];
};

// Pet (Cat) service functions kết nối trực tiếp với backend
export const petService = {
  // Lấy tất cả mèo (bao gồm thông tin product)
  async getAllPets(params: { page?: number; size?: number } = {}): Promise<PetRecord[]> {
    const { page = 0, size = 100 } = params;
    const data = await apiService.get<unknown>(
      `${API_CONFIG.ENDPOINTS.CAT_DETAILS.LIST_ADMIN}?page=${page}&size=${size}`
    );
    return extractRecords(data);
  },

  // Lấy chi tiết mèo theo ID
  async getPetById(id: number): Promise<PetRecord> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CAT_DETAILS.DETAIL_ADMIN, { id });
    return apiService.get<PetRecord>(url);
  },

  // Tạo mèo mới (cat detail + product)
  async createPet(petData: Partial<PetRecord>): Promise<PetRecord> {
    return apiService.post<PetRecord>(API_CONFIG.ENDPOINTS.CAT_DETAILS.CREATE, petData);
  },

  // Cập nhật thông tin mèo
  async updatePet(id: number, petData: Partial<PetRecord>): Promise<PetRecord> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CAT_DETAILS.UPDATE, { id });
    return apiService.put<PetRecord>(url, petData);
  },

  // Xóa mèo
  async deletePet(id: number): Promise<void> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CAT_DETAILS.DELETE, { id });
    return apiService.delete<void>(url);
  },

  // Tìm kiếm mèo theo từ khóa (fallback bằng filter client)
  async searchPets(query: string): Promise<PetRecord[]> {
    if (!query.trim()) {
      return this.getAllPets();
    }

    try {
      const results = await apiService.get<unknown>(
        `${API_CONFIG.ENDPOINTS.CAT_DETAILS.LIST_ADMIN}?keyword=${encodeURIComponent(query)}`
      );
      const parsed = extractRecords(results);
      if (parsed.length) {
        return parsed;
      }
    } catch (error) {
      console.warn("Cat detail search endpoint chưa hỗ trợ keyword. Fallback sang filter local.", error);
    }

    const allPets = await this.getAllPets();
    const needle = query.trim().toLowerCase();
    return allPets.filter((pet) => {
      const haystack = [
        pet.product?.productName,
        pet.breed,
        pet.gender,
        pet.product?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  },
};

export default petService;

