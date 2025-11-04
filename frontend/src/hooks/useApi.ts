import { useState, useEffect } from 'react';
import { productService, productTypeService, categoryService } from '@/services/productService';
import { userService } from '@/services/userService';
import { orderService } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import { catDetailService } from '@/services/catDetailService';
import { 
  Product, 
  ProductType, 
  Category, 
  User, 
  Order, 
  Review,
  CatDetail 
} from '@/types';

// Hook để quản lý sản phẩm qua API
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByType = async (typeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsByType(typeId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProductsByCategory(categoryId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.searchProducts(searchTerm);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'product_id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(prev => prev.map(p => p.product_id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.product_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    error,
    loadProducts,
    loadProductsByType,
    loadProductsByCategory,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};

// Hook để quản lý loại sản phẩm qua API
export const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 useProductTypes: Đang tải product types...");
      const data = await productTypeService.getAllProductTypes();
      console.log("✅ useProductTypes: Nhận được product types:", data);
      console.log("📊 Số lượng product types:", data?.length || 0);
      setProductTypes(data || []);
    } catch (err) {
      console.error("❌ useProductTypes: Lỗi khi tải product types:", err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductTypes();
  }, []);

  return {
    productTypes,
    loading,
    error,
    loadProductTypes
  };
};

// Hook để quản lý danh mục qua API
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 useCategories: Đang tải categories...");
      const data = await categoryService.getAllCategories();
      console.log("✅ useCategories: Nhận được categories:", data);
      console.log("📊 Số lượng categories:", data?.length || 0);
      setCategories(data || []);
    } catch (err) {
      console.error("❌ useCategories: Lỗi khi tải categories:", err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesByType = async (typeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategoriesByType(typeId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'category_id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [newCategory, ...prev]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, categoryData: Partial<Category>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
      setCategories(prev => prev.map(c => c.category_id === id ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.category_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    loadCategories,
    loadCategoriesByType,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

// Hook để quản lý người dùng qua API
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const getUserById = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserById(id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserByEmail = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserByEmail(email);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'user_id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await userService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(u => u.user_id === id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.user_id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser
  };
};

// Hook để quản lý đơn hàng qua API
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersByUserId = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrdersByUserId(userId);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'order_id' | 'order_date'>) => {
    try {
      setLoading(true);
      setError(null);
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.order_id === id ? updatedOrder : o));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    loadOrders,
    loadOrdersByUserId,
    createOrder,
    updateOrderStatus
  };
};

// Hook để quản lý đánh giá qua API
export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviewsByProduct = async (productId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewService.getReviewsByProduct(productId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: Omit<Review, 'review_id' | 'created_at'>) => {
    try {
      setLoading(true);
      setError(null);
      const newReview = await reviewService.createReview(reviewData);
      setReviews(prev => [newReview, ...prev]);
      return newReview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    loadReviewsByProduct,
    createReview
  };
};

// Hook để quản lý chi tiết mèo qua API
export const useCatDetails = () => {
  const [catDetails, setCatDetails] = useState<CatDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await catDetailService.getAllCatDetails();
      setCatDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const createCatDetail = async (catData: Omit<CatDetail, 'cat_id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newCatDetail = await catDetailService.createCatDetail(catData);
      setCatDetails(prev => [newCatDetail, ...prev]);
      return newCatDetail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatDetails();
  }, []);

  return {
    catDetails,
    loading,
    error,
    loadCatDetails,
    createCatDetail
  };
};
