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
  number: number; // current page
  sort: {
    sorted: boolean;
    unsorted: boolean;
  };
  };

interface SortConfig {
  field: 'expiryDate' | 'weightKg' | 'ingredients';
  direction: 'asc' | 'desc';
}

const FoodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [foodDetails, setFoodDetails] = useState<FoodDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FoodDetail | null>(null);
  const [editWeight, setEditWeight] = useState<number | ''>('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [allFoodDetails, setAllFoodDetails] = useState<FoodDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState<SortConfig>({ field: 'expiryDate', direction: 'asc' });
  const [loadingList, setLoadingList] = useState(false);
  const [searchTermAdmin, setSearchTermAdmin] = useState('');
  const [searchingAdmin, setSearchingAdmin] = useState(false);
  const [expiryFilterAdmin, setExpiryFilterAdmin] = useState('');
  const [filteringExpiryAdmin, setFilteringExpiryAdmin] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchFoodDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin/food-details/${id}`);
        
        // Handle both response shapes: data.data or direct data
        const foodData = response.data?.data || response.data;
        
        if (foodData) {
          setFoodDetails(foodData);
          // Initialize edit fields
          setEditWeight(foodData.weightKg ?? '');
          setEditIngredients(foodData.ingredients ?? '');
          // Normalize date to yyyy-MM-dd for input[type=date]
          setEditExpiry(foodData.expiryDate ? new Date(foodData.expiryDate).toISOString().slice(0,10) : '');
          
          toast({
            title: "Success",
            description: "Food details loaded successfully"
          });
        } else {
          setError('No food details found');
          toast({
            title: "Warning",
            description: "No food details found for this product",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching food details:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to load food details';
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have an ID and it's a food product (type_id === 2)
    if (id && product?.type_id === 2) {
      fetchFoodDetails();
    }
  }, [id, product, toast]);

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

  const handleSaveFoodDetails = async () => {
    if (!product || product.type_id !== 2) return;

    setSaving(true);
    try {
      const response = await axios.post('/api/admin/food-details', {
        foodId: product.product_id,
        weightKg: 1.0,
        ingredients: "Default ingredients",
        expiryDate: "2025-12-31"
      });

      setFoodDetails(response.data.data);
      // initialize edit fields after create
      const d = response.data.data;
      setEditWeight(d?.weightKg ?? '');
      setEditIngredients(d?.ingredients ?? '');
      setEditExpiry(d?.expiryDate ? new Date(d.expiryDate).toISOString().slice(0,10) : '');
      toast({
        title: "Success",
        description: "Food details saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save food details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product.stock_quantity || 0)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      // TODO: Implement add to cart functionality
      // await addToCart(product.product_id, quantity);
      toast({
        title: "Success",
        description: `Added ${quantity} ${product.product_name} to cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFoodDetails = async () => {
    if (!product || product.type_id !== 2 || !foodDetails) return;
    
    setSaving(true);
    try {
      const payload = {
        foodId: foodDetails.foodId,
        weightKg: Number(editWeight) || 0,
        ingredients: editIngredients.trim(),
        expiryDate: editExpiry
      };
      
      const response = await axios.put(`/api/admin/food-details/${foodDetails.foodId}`, payload);
      const updatedData = response.data?.data || response.data;
      setFoodDetails(updatedData);
      
      toast({
        title: "Success",
        description: "Food details updated successfully",
      });
    } catch (error) {
      console.error('Failed to update food details:', error);
      toast({
        title: "Error",
        description: "Failed to update food details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!foodDetails) return;
    // Reset form to current values
    setEditWeight(foodDetails.weightKg);
    setEditIngredients(foodDetails.ingredients);
    setEditExpiry(foodDetails.expiryDate ? new Date(foodDetails.expiryDate).toISOString().slice(0,10) : '');
  };

  const handleDeleteFoodDetails = async (foodId: number) => {
    if (!confirm('Are you sure you want to delete these food details?')) return;
    
    setSaving(true);
    try {
      await axios.delete(`/api/admin/food-details/${foodId}`);
      
      // Refresh the list after deletion
      await fetchAllFoodDetails();
      
      toast({
        title: "Success",
        description: "Food details deleted successfully"
      });
    } catch (error) {
      console.error('Failed to delete food details:', error);
      toast({
        title: "Error",
        description: "Failed to delete food details",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const fetchAllFoodDetails = async (page = currentPage) => {
    setLoadingList(true);
    try {
      const response = await axios.get<PaginatedResponse>(
        `/api/admin/food-details?page=${page}&size=${pageSize}&sort=${sort.field},${sort.direction}`
      );
      
      if (response.data) {
        setAllFoodDetails(response.data.content);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      }
    } catch (error) {
      console.error('Error fetching food details list:', error);
      toast({
        title: "Error",
        description: "Failed to load food details list",
        variant: "destructive"
      });
    } finally {
      setLoadingList(false);
    }
  };

  // Load danh sách food details khi component mount hoặc khi page/sort thay đổi
  useEffect(() => {
    fetchAllFoodDetails();
  }, [currentPage, pageSize, sort]);

  const handleSort = (field: SortConfig['field']) => {
    setSort(current => ({
      field,
      direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const isInStock = product.stock_quantity > 0;

  // Table component cho danh sách food details
  const FoodDetailsTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('weightKg')}>
              Weight (kg)
              {sort.field === 'weightKg' && (
                <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('ingredients')}>
              Ingredients
              {sort.field === 'ingredients' && (
                <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('expiryDate')}>
              Expiry Date
              {sort.field === 'expiryDate' && (
                <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allFoodDetails.map((detail) => (
            <tr key={detail.foodId}>
              <td className="px-6 py-4 whitespace-nowrap">{detail.weightKg}</td>
              <td className="px-6 py-4">{detail.ingredients}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(detail.expiryDate).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => setEditingProduct(detail)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteFoodDetails(detail.foodId)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(page => Math.max(0, page - 1))}
            disabled={currentPage === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(page => page + 1)}
            disabled={currentPage >= totalPages - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage + 1}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.max(0, page - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => page + 1)}
                disabled={currentPage >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Last
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );

  // Search admin endpoint by ingredients
  const searchByIngredientsAdmin = async (ingredients: string) => {
    await searchFilterAdmin(ingredients, '');
  };

    // Combined search + filter admin endpoint
    const searchFilterAdmin = async (ingredients: string, expiryBefore: string) => {
      // if both empty, reload full paginated list
      if ((!ingredients || ingredients.trim() === '') && (!expiryBefore || expiryBefore.trim() === '')) {
        await fetchAllFoodDetails(0);
        return;
      }

      try {
        setSearchingAdmin(true);
        setFilteringExpiryAdmin(true);

        const params: string[] = [];
        if (ingredients && ingredients.trim() !== '') params.push(`ingredients=${encodeURIComponent(ingredients.trim())}`);
        if (expiryBefore && expiryBefore.trim() !== '') params.push(`expiryBefore=${encodeURIComponent(expiryBefore.trim())}`);

        const url = `/api/admin/food-details/search-filter?${params.join('&')}`;
        const resp = await axios.get<FoodDetail[]>(url);
        setAllFoodDetails(resp.data || []);
        setTotalPages(0);
        toast({ title: 'Search+Filter complete', description: `Found ${resp.data?.length || 0} result(s)` });
      } catch (err) {
        console.error('Admin search-filter error:', err);
        toast({ title: 'Error', description: 'Search+Filter failed', variant: 'destructive' });
      } finally {
        setSearchingAdmin(false);
        setFilteringExpiryAdmin(false);
      }
    };

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

          {/* Food Details Section */}
          {product.type_id === 2 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Food Details</h3>
              {foodDetails ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editWeight ?? ''}
                      onChange={(e) => setEditWeight(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-40 px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ingredients</label>
                    <textarea
                      value={editIngredients}
                      onChange={(e) => setEditIngredients(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={editExpiry}
                      onChange={(e) => setEditExpiry(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateFoodDetails}
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Update'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteFoodDetails(foodDetails.foodId)}
                      disabled={saving}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {saving ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSaveFoodDetails}
                  disabled={saving}
                  className="text-primary hover:text-primary/80"
                >
                  {saving ? 'Saving...' : 'Add Food Details'}
                </button>
              )}
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
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.stock_quantity}
                className="w-20 px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isInStock}
            onClick={handleAddToCart}
          >
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
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
      
      {/* Admin: searchable list of Food Details */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Admin — Food Details</h2>
        <div className="bg-white p-4 rounded-md mb-4">
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search ingredients (e.g. Chicken)"
              value={searchTermAdmin}
              onChange={(e) => setSearchTermAdmin(e.target.value)}
              className="flex-1 min-w-[220px] px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => searchByIngredientsAdmin(searchTermAdmin)}
              disabled={searchingAdmin}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {searchingAdmin ? 'Searching...' : 'Search'}
            </button>

            <button
              onClick={() => searchFilterAdmin(searchTermAdmin, expiryFilterAdmin)}
              disabled={searchingAdmin || filteringExpiryAdmin}
              className="px-4 py-2 bg-primary/80 text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {searchingAdmin || filteringExpiryAdmin ? 'Processing...' : 'Search & Filter'}
            </button>

            <label className="text-sm">Expiry before:</label>
            <input
              type="date"
              value={expiryFilterAdmin}
              onChange={(e) => setExpiryFilterAdmin(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => searchFilterAdmin('', expiryFilterAdmin)}
              disabled={filteringExpiryAdmin}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {filteringExpiryAdmin ? 'Filtering...' : 'Filter'}
            </button>

            <button
              onClick={() => { setSearchTermAdmin(''); setExpiryFilterAdmin(''); fetchAllFoodDetails(0); }}
              className="px-3 py-2 border rounded-md hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md">
          {loadingList ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FoodDetailsTable />
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;