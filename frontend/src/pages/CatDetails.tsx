import React, { useState } from 'react';
import axios from 'axios';

interface CreateCatDetailPayload {
  catId: number;
  breed: string;
  age: number;
  gender: string;
  vaccinated: boolean;
}

const CatDetails: React.FC = () => {
  const [catId, setCatId] = useState<number | ''>('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [vaccinated, setVaccinated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (typeof catId !== 'number' || typeof age !== 'number' || !breed.trim() || !gender) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
      return;
    }

    const payload: CreateCatDetailPayload = {
      catId: Number(catId),
      breed: breed.trim(),
      age: Number(age),
      gender,
      vaccinated,
    };

    setSubmitting(true);
    try {
      const resp = await axios.post('http://localhost:8080/api/admin/cat-details', payload);
      const data = resp.data?.data ?? resp.data;
      setMessage({ type: 'success', text: 'Tạo CatDetails thành công.' });
      // console.log('Created CatDetail:', data);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Tạo CatDetails thất bại. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setMessage(null);

    if (typeof catId !== 'number' || typeof age !== 'number' || !breed.trim() || !gender) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
      return;
    }

    const payload: CreateCatDetailPayload = {
      catId: Number(catId),
      breed: breed.trim(),
      age: Number(age),
      gender,
      vaccinated,
    };

    const targetId = typeof catId !== 'number' ? 1 : Number(catId);

    setSubmitting(true);
    try {
      const resp = await axios.put(`http://localhost:8080/api/admin/cat-details/${targetId}`, payload);
      const data = resp.data?.data ?? resp.data;
      setMessage({ type: 'success', text: `Cập nhật CatDetails (ID ${targetId}) thành công.` });
      // console.log('Updated CatDetail:', data);
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Cập nhật CatDetails thất bại. Vui lòng thử lại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Tạo Cat Details</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Cat ID</label>
          <input
            type="number"
            value={catId}
            onChange={(e) => setCatId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Nhập Cat ID (product_id của mèo)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Breed</label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="VD: British Shorthair"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            type="number"
            min={0}
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Tuổi (tháng)"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | '')}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            <option value="">-- Chọn giới tính --</option>
            <option value="Male">Đực (Male)</option>
            <option value="Female">Cái (Female)</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="vaccinated"
            type="checkbox"
            checked={vaccinated}
            onChange={(e) => setVaccinated(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="vaccinated" className="text-sm font-medium">
            Đã tiêm phòng
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Đang tạo...' : 'Tạo Cat Details'}
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="ml-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật Cat Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CatDetails;