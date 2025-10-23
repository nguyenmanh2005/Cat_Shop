import axios from 'axios';

// Demo API endpoints - có thể thay thế bằng API thật
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Pet service functions
export const petService = {
  // Lấy danh sách thú cưng (demo với posts)
  async getAllPets() {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết thú cưng
  async getPetById(id: string) {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pet details:', error);
      throw error;
    }
  },

  // Tạo mới thú cưng
  async createPet(petData: any) {
    try {
      const response = await api.post('/posts', petData);
      return response.data;
    } catch (error) {
      console.error('Error creating pet:', error);
      throw error;
    }
  },

  // Cập nhật thông tin thú cưng
  async updatePet(id: string, petData: any) {
    try {
      const response = await api.put(`/posts/${id}`, petData);
      return response.data;
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  },

  // Xóa thú cưng
  async deletePet(id: string) {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  },

  // Tìm kiếm thú cưng
  async searchPets(query: string) {
    try {
      const response = await api.get(`/posts?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching pets:', error);
      throw error;
    }
  }
};

export default api;