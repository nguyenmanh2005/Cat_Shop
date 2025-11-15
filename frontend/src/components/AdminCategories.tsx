import React, { useState } from 'react';
import axios from 'axios';

interface Category {
  id?: number;
  name: string;
  description?: string;
}

const AdmiinCategories: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [updateId, setUpdateId] = useState<number | ''>('');
const [updateName, setUpdateName] = useState('');
const [updateDescription, setUpdateDescription] = useState('');


  const createCategory = async () => {
    if (!name.trim()) {
      setMessage('Tên category không được để trống');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const payload: Category = { name, description };
      const resp = await axios.post('http://localhost:8080/api/categories/admin', payload);
      setMessage(`Tạo category thành công! ID: ${resp.data?.id ?? 'N/A'}`);
      setName('');
      setDescription('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Tạo category thất bại';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };
  const updateCategory = async () => {
  if (typeof updateId !== 'number') {
    setMessage('Vui lòng nhập ID hợp lệ để cập nhật');
    return;
  }
  if (!updateName.trim()) {
    setMessage('Tên category không được để trống');
    return;
  }
  setLoading(true);
  setMessage(null);
  try {
    const payload = { name: updateName, description: updateDescription };
    const resp = await axios.put(`http://localhost:8080/api/categories/admin/${updateId}`, payload);
    setMessage(`Cập nhật category thành công! ID: ${resp.data?.id ?? updateId}`);
    setUpdateId('');
    setUpdateName('');
    setUpdateDescription('');
  } catch (err: any) {
    const errMsg = err?.response?.data?.message || err?.message || 'Cập nhật category thất bại';
    setMessage(errMsg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Quản lý Categories</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Tên Category</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Nhập tên category"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Mô tả (tuỳ chọn)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Nhập mô tả"
        />
      </div>

      <button
        onClick={createCategory}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Đang tạo...' : 'Tạo Category'}
      </button>

      {message && (
        <div className="mt-4 p-3 rounded bg-gray-100 text-gray-700">{message}</div>
      )}
    </div>

    
  );
};

export default AdmiinCategories;
