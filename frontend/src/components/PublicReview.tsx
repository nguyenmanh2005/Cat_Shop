import React, { useState } from 'react';
import axios from 'axios';

interface ReviewItem {
  review_id?: number;
  user_id?: number;
  product_id?: number;
  rating: number;
  comment?: string;
  created_at?: string;
  user?: { username?: string };
}

const PublicReview: React.FC = () => {
  const [productId, setProductId] = useState<number | ''>(2);
  const [userId, setUserId] = useState<number | ''>('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewId, setReviewId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [average, setAverage] = useState<number | null>(null);


  const fetchByProduct = async () => {
    setMessage(null);
    const id = typeof productId === 'number' ? productId : 2;
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/api/reviews/product/${id}`);
      const data = (resp.data?.data ?? resp.data) as ReviewItem[];
      setReviews(Array.isArray(data) ? data : []);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage('No reviews found for this product.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load reviews.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchByUser = async () => {
    setMessage(null);
    if (typeof userId !== 'number') {
      setMessage('Please provide a valid User ID.');
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/api/reviews/user/${userId}`);
      const data = (resp.data?.data ?? resp.data) as ReviewItem[];
      setReviews(Array.isArray(data) ? data : []);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage('No reviews found for this user.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load reviews.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async () => {
    setMessage(null);
    if (typeof reviewId !== 'number') {
      setMessage('Please provide a valid Review ID.');
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/api/reviews/${reviewId}`);
      const data = (resp.data?.data ?? resp.data) as ReviewItem;
      if (data) {
        setReviews([data]);
      } else {
        setReviews([]);
        setMessage('Review not found.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load review.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverage = async () => {
    setMessage(null);
    const id = typeof productId === 'number' ? productId : 2;
    setLoading(true);
    try {
      const resp = await axios.get(`http://localhost:8080/api/reviews/product/${id}/average`);
      const avg = resp.data?.data ?? resp.data; // tuỳ backend trả về
      setAverage(avg);
      if (avg === null || avg === undefined) {
        setMessage('No average rating available.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load average rating.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Product Reviews</h1>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          type="button"
          onClick={fetchAverage}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Average'}
        </button>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-40 px-3 py-2 border rounded-md"
          placeholder="Product ID"
        />
        <button
          type="button"
          onClick={fetchByProduct}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Reviews'}
        </button>

        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-40 px-3 py-2 border rounded-md"
          placeholder="User ID"
        />
        <button
          type="button"
          onClick={fetchByUser}
          disabled={loading}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load by User'}
        </button>

        <input
          type="number"
          value={reviewId}
          onChange={(e) => setReviewId(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-40 px-3 py-2 border rounded-md"
          placeholder="Review ID"
        />
        <button
          type="button"
          onClick={fetchById}
          disabled={loading}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load by ID'}
        </button>
      </div>

        {message && (
            <div className="mb-4 p-3 rounded bg-gray-100 text-gray-700">{message}</div>
        )}

        {average !== null && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800">
            Average Rating: {average.toFixed(2)} / 5
        </div>
        )}

      <div className="bg-white rounded-md border divide-y">
        {reviews.map((r) => (
          <div key={r.review_id ?? Math.random()} className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Rating: {r.rating}/5</div>
              <div className="text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
            </div>
            <div className="text-sm text-gray-600">By: {r.user?.username ?? r.user_id ?? 'Anonymous'}</div>
            {r.comment && <p className="mt-2">{r.comment}</p>}
          </div>
        ))}
        {!loading && reviews.length === 0 && !message && (
          <div className="p-4 text-gray-500">No data</div>
        )}
      </div>
    </div>
  );
};

export default PublicReview;


