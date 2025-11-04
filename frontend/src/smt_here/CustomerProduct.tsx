import React, { useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
}

const ProductTable: React.FC<{ products: Product[] }> = ({ products }) => (
  <div className="mt-4 overflow-x-auto">
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-2 py-1">ID</th>
          <th className="border px-2 py-1">Name</th>
          <th className="border px-2 py-1">Description</th>
          <th className="border px-2 py-1">Price</th>
          <th className="border px-2 py-1">Stock</th>
          <th className="border px-2 py-1">Category ID</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td className="border px-2 py-1">{p.id}</td>
            <td className="border px-2 py-1">{p.name}</td>
            <td className="border px-2 py-1">{p.description}</td>
            <td className="border px-2 py-1">{p.price}</td>
            <td className="border px-2 py-1">{p.stock}</td>
            <td className="border px-2 py-1">{p.categoryId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CustomerProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [typeId, setTypeId] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceProducts, setPriceProducts] = useState<Product[]>([]);

  const fetchData = async (
    url: string,
    setter: React.Dispatch<React.SetStateAction<Product[] | Product | null>>,
    noDataMsg: string,
    isList = true,
    validate?: () => boolean
  ) => {
    if (validate && !validate()) return;
    setLoading(true);
    setMessage(null);
    if (isList) setter([]);
    else setter(null);
    try {
      const resp = await axios.get(url);
      const data = resp.data?.data ?? resp.data;
      setter(isList ? (Array.isArray(data) ? data : []) : data);
      if (!data || (isList && data.length === 0)) setMessage(noDataMsg);
    } catch (err: any) {
      setMessage(err?.response?.data?.message || err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = () => fetchData('http://localhost:8080/api/customer/products', setProducts, 'No products found');

  const fetchProductDetail = () => {
    const idNum = Number(productId);
    if (isNaN(idNum) || idNum <= 0) {
      setMessage('Please enter a valid product ID');
      return;
    }
    fetchData(`http://localhost:8080/api/customer/products/${idNum}`, setProduct, 'Product not found', false);
  };

  const fetchProductsByType = () => {
    const idNum = Number(typeId);
    if (isNaN(idNum) || idNum <= 0) {
      setMessage('Please enter a valid type ID');
      return;
    }
    fetchData(`http://localhost:8080/api/customer/products/type/${idNum}`, setFilteredProducts, 'No products found for this type');
  };

  const fetchProductsByCategory = () => {
    const idNum = Number(categoryId);
    if (isNaN(idNum) || idNum <= 0) {
      setMessage('Please enter a valid category ID');
      return;
    }
    fetchData(`http://localhost:8080/api/customer/products/category/${idNum}`, setCategoryProducts, 'No products found for this category');
  };

  const searchProducts = () => {
    if (!keyword.trim()) {
      setMessage('Please enter a keyword to search');
      return;
    }
    fetchData(`http://localhost:8080/api/customer/products/search?keyword=${encodeURIComponent(keyword)}`, setSearchResults, 'No products found for this keyword');
  };

  const fetchProductsByPriceRange = () => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (isNaN(min) || isNaN(max) || min < 0 || max <= 0 || min > max) {
      setMessage('Please enter a valid price range');
      return;
    }
    fetchData(`http://localhost:8080/api/customer/products/price-range?min=${min}&max=${max}`, setPriceProducts, 'No products found in this price range');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Products</h1>
      <button onClick={fetchAllProducts} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Loading...' : 'Get All Products'}
      </button>
      {message && <div className="mt-4 p-3 rounded bg-gray-100 text-gray-700">{message}</div>}
      {products.length > 0 && <ProductTable products={products} />}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Product Detail</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Product ID</label>
          <input type="number" value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter product ID" />
        </div>
        <button onClick={fetchProductDetail} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
          {loading ? 'Loading...' : 'Get Product Detail'}
        </button>
        {product && (
          <div className="mt-4 p-3 border rounded bg-white shadow">
            <p><strong>ID:</strong> {product.id}</p>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Price:</strong> {product.price}</p>
            <p><strong>Stock:</strong> {product.stock}</p>
            <p><strong>Category ID:</strong> {product.categoryId}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Filter Products by Type</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Type ID</label>
          <input type="number" value={typeId} onChange={(e) => setTypeId(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter type ID" />
        </div>
        <button onClick={fetchProductsByType} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50">
          {loading ? 'Loading...' : 'Get Products by Type'}
        </button>
        {filteredProducts.length > 0 && <ProductTable products={filteredProducts} />}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Filter Products by Category</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Category ID</label>
          <input type="number" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter category ID" />
        </div>
        <button onClick={fetchProductsByCategory} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Loading...' : 'Get Products by Category'}
        </button>
        {categoryProducts.length > 0 && <ProductTable products={categoryProducts} />}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Search Products</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Keyword</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Enter keyword" />
        </div>
        <button onClick={searchProducts} disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50">
          {loading ? 'Searching...' : 'Search Products'}
        </button>
        {searchResults.length > 0 && <ProductTable products={searchResults} />}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Filter Products by Price Range</h2>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Min Price</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Min" />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Max Price</label>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Max" />
          </div>
        </div>
        <button onClick={fetchProductsByPriceRange} disabled={loading} className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50">
          {loading ? 'Loading...' : 'Get Products by Price Range'}
        </button>
        {priceProducts.length > 0 && <ProductTable products={priceProducts} />}
      </div>
    </div>
  );
};

export default CustomerProduct;