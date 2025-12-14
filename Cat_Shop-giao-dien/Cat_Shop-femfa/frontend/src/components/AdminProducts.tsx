import React, { useState } from 'react';
import axios from 'axios';

interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
}

const AdminProducts: React.FC = () => {
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [price, setPrice] = useState('');
const [stock, setStock] = useState('');
const [categoryId, setCategoryId] = useState('');
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState<string | null>(null);
const [updateId, setUpdateId] = useState('');
const [updateName, setUpdateName] = useState('');
const [updateDescription, setUpdateDescription] = useState('');
const [updatePrice, setUpdatePrice] = useState('');
const [updateStock, setUpdateStock] = useState('');
const [updateCategoryId, setUpdateCategoryId] = useState('');
const [deleteId, setDeleteId] = useState('');

  const createProduct = async () => {
    if (!name.trim() || !price || !stock || !categoryId) {
      setMessage('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const payload: Product = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
      };
      const resp = await axios.post('http://localhost:8080/api/admin/products', payload);
      setMessage(`Product created successfully! ID: ${resp.data?.id ?? 'N/A'}`);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to create product';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };
const updateProduct = async () => {
  const idNum = Number(updateId);
  if (isNaN(idNum) || idNum <= 0) {
    setMessage('Please enter a valid product ID');
    return;
  }
  if (!updateName.trim() || !updatePrice || !updateStock || !updateCategoryId) {
    setMessage('Please fill in all required fields');
    return;
  }
  setLoading(true);
  setMessage(null);
  try {
    const payload = {
      name: updateName,
      description: updateDescription,
      price: Number(updatePrice),
      stock: Number(updateStock),
      categoryId: Number(updateCategoryId),
    };
    await axios.put(`http://localhost:8080/api/admin/products/${idNum}`, payload);
    setMessage(`Product updated successfully! ID: ${idNum}`);
    setUpdateId('');
    setUpdateName('');
    setUpdateDescription('');
    setUpdatePrice('');
    setUpdateStock('');
    setUpdateCategoryId('');
  } catch (err: any) {
    const errMsg = err?.response?.data?.message || err?.message || 'Failed to update product';
    setMessage(errMsg);
  } finally {
    setLoading(false);
  }
};
const deleteProduct = async () => {
  const idNum = Number(deleteId);
  if (isNaN(idNum) || idNum <= 0) {
    setMessage('Please enter a valid product ID');
    return;
  }
  setLoading(true);
  setMessage(null);
  try {
    await axios.delete(`http://localhost:8080/api/admin/products/${idNum}`);
    setMessage(`Product deleted successfully! ID: ${idNum}`);
    setDeleteId('');
  } catch (err: any) {
    const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete product';
    setMessage(errMsg);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter product name"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter description"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter price"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Stock</label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter stock quantity"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Category ID</label>
        <input
          type="number"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter category ID"
        />
      </div>

      <button
        onClick={createProduct}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Product'}
      </button>

      {message && (
        <div className="mt-4 p-3 rounded bg-gray-100 text-gray-700">{message}</div>
      )}

      <h2 className="text-xl font-bold mb-4">Update Product</h2>

  <div className="mb-4">
    <label className="block mb-1 font-medium">Product ID</label>
    <input
      type="number"
      value={updateId}
      onChange={(e) => setUpdateId(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter product ID"
    />
  </div>

  <div className="mb-4">
    <label className="block mb-1 font-medium">New Name</label>
    <input
      type="text"
      value={updateName}
      onChange={(e) => setUpdateName(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter new name"
    />
  </div>

  <div className="mb-4">
    <label className="block mb-1 font-medium">New Description</label>
    <textarea
      value={updateDescription}
      onChange={(e) => setUpdateDescription(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter new description"
    />
  </div>

  <div className="mb-4">
    <label className="block mb-1 font-medium">New Price</label>
    <input
      type="number"
      value={updatePrice}
      onChange={(e) => setUpdatePrice(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter new price"
    />
  </div>

  <div className="mb-4">
    <label className="block mb-1 font-medium">New Stock</label>
    <input
      type="number"
      value={updateStock}
      onChange={(e) => setUpdateStock(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter new stock"
    />
  </div>

  <div className="mb-4">
    <label className="block mb-1 font-medium">New Category ID</label>
    <input
      type="number"
      value={updateCategoryId}
      onChange={(e) => setUpdateCategoryId(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter new category ID"
    />
  </div>
  
<div className="mt-8">
  <h2 className="text-xl font-bold mb-4">Delete Product</h2>

  <div className="mb-4">
    <label className="block mb-1 font-medium">Product ID</label>
    <input
      type="number"
      value={deleteId}
      onChange={(e) => setDeleteId(e.target.value)}
      className="w-full px-3 py-2 border rounded-md"
      placeholder="Enter product ID to delete"
    />
  </div>

  <button
    onClick={deleteProduct}
    disabled={loading}
    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
  >
    {loading ? 'Deleting...' : 'Delete Product'}
  </button>
</div>

  
    </div>
  );
};

export default AdminProducts;
