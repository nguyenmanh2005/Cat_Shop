import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Product } from '../types';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { productService } from '../services/productService';

interface FoodDetail {
  foodId: number;
  weightKg: number;
  ingredients: string;
  expiryDate: string;
}

interface PaginatedResponse {
  content: FoodDetail[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const FoodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [foodDetails, setFoodDetails] = useState<FoodDetail | null>(null);
  const [allFoodDetails, setAllFoodDetails] = useState<FoodDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(Number(id));
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Fetch list of food details (paginated)
  const fetchAllFoodDetails = async (page = currentPage) => {
    try {
      const response = await axios.get<PaginatedResponse>(`/api/food-details?page=${page}&size=10`);
      setAllFoodDetails(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching all food details:', error);
      toast({
        title: "Error",
        description: "Failed to load food details list",
        variant: "destructive",
      });
    }
  };

  // Search by ingredients (called from UI)
  const searchByIngredients = async (ingredients: string) => {
    if (!ingredients || ingredients.trim() === '') {
      // if empty, reload paginated list
      fetchAllFoodDetails(0);
      return;
    }

    try {
      setSearching(true);
      const encoded = encodeURIComponent(ingredients.trim());
      const resp = await axios.get<FoodDetail[]>(`/api/food-details/search?ingredients=${encoded}`);
      // API returns array of FoodDetail
      setAllFoodDetails(resp.data || []);
      setTotalPages(0);
      toast({ title: 'Search complete', description: `Found ${resp.data?.length || 0} result(s)` });
    } catch (err) {
      console.error('Search error:', err);
      toast({ title: 'Error', description: 'Search failed', variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  // Load food details if product is type food
  useEffect(() => {
    const fetchFoodDetails = async () => {
      if (!id) return;
      
      try {
        // Gọi API để lấy chi tiết food theo ID
        const response = await axios.get(`/api/food-details/${id}`);
        if (response.data) { // Đã bỏ .data vì API trả về trực tiếp object
          setFoodDetails(response.data);
          // Hiển thị thông báo thành công
          toast({
            title: "Success",
            description: "Food details loaded successfully",
          });
        }
      } catch (error) {
        console.error('Error fetching food details:', error);
        // Hiển thị thông báo lỗi
        toast({
          title: "Error",
          description: "Failed to load food details",
          variant: "destructive",
        });
      }
    };

    // Fetch food details nếu có ID và sản phẩm là loại food
    if (id && product?.type_id === 2) {
      fetchFoodDetails();
    }
    
    // Luôn fetch danh sách tất cả food details
    fetchAllFoodDetails();
  }, [id, product, currentPage]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock_quantity || 0)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post('/api/cart/add', {
        productId: product?.product_id,
        quantity: quantity
      });
      
      toast({
        title: "Success",
        description: `Added ${quantity} ${product?.product_name} to cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-600 py-8">
      Error loading product details. Please try again later.
    </div>
  );
  
  if (!product) return (
    <div className="text-center py-8">
      Product not found
    </div>
  );

  const isInStock = product.stock_quantity > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img
            src={product.image_url || '/placeholder-food.png'}
            alt={product.product_name}
            className="w-full h-auto rounded-lg shadow-lg object-cover aspect-square"
          />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
          <p className="text-2xl text-primary mb-4">${product.price.toFixed(2)}</p>
          <div className="prose max-w-none mb-6">
            <p>{product.description || 'No description available'}</p>
          </div>

          {/* Food Details Section - Read Only */}
          {product.type_id === 2 && foodDetails && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Product Information</h3>
              <div className="space-y-2 text-sm">
                <p>Weight: {foodDetails.weightKg} kg</p>
                <p>Ingredients: {foodDetails.ingredients}</p>
                <p>Best Before: {new Date(foodDetails.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            <span className="text-sm font-medium">
              Status: {isInStock ? (
                <span className="text-green-600">In Stock ({product.stock_quantity} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </span>
          </div>

          {/* Quantity Selector */}
          {isInStock && (
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                  className="px-3 py-2 border rounded-md hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock_quantity}
                  className="w-20 px-3 py-2 border rounded-md text-center"
                />
                <button 
                  onClick={() => quantity < product.stock_quantity && setQuantity(q => q + 1)}
                  className="px-3 py-2 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isInStock}
            onClick={handleAddToCart}
          >
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* List All Food Details */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">All Food Products</h2>
        {/* Search by ingredients */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ingredients (e.g. Chicken)"
            className="px-3 py-2 border rounded-md w-full sm:w-1/2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => searchByIngredients(searchTerm)}
              disabled={searching}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => { setSearchTerm(''); searchByIngredients(''); }}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allFoodDetails.map((detail) => (
                <tr key={detail.foodId} className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      // Chuyển đến trang chi tiết khi click vào row
                      window.location.href = `/food/${detail.foodId}`;
                    }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {detail.foodId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {detail.weightKg}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {detail.ingredients}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(detail.expiryDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i ? 'bg-primary text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 rounded border hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Category</h3>
            <p>{product.category?.category_name || 'Uncategorized'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Type</h3>
            <p>{product.type?.type_name || 'Unspecified'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;