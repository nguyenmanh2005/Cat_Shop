import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Review {
  id: number;
  content: string;
  rating: number;
  // Thêm fields khác như userId, productId, date...
}

const AdminReview: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');


  const fetchAllReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/reviews/admin/all');
      setReviews(response.data);
    } catch (err) {
      setError('Error while getting reviews!');
    } finally {
      setLoading(false);
    }
  };

    const fetchHighReviews = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await axios.get('http://localhost:8080/api/reviews/admin/high');
        setReviews(response.data);
    } catch (err) {
        setError('Error while getting high rating reviews!');
    } finally {
        setLoading(false);
    }
    };
    const fetchSearch = async () => {
    if (!keyword.trim()) {
        setError('Please enter a keyword');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const response = await axios.get(`http://localhost:8080/api/reviews/admin/search?keyword=${encodeURIComponent(keyword)}`);
        setReviews(response.data);
    } catch (err) {
        setError('Error while searching reviews!');
    } finally {
        setLoading(false);
    }
    };



  const fetchLowReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/reviews/admin/low');
      setReviews(response.data);
    } catch (err) {
      setError('Error while getting low rating reviews!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  return (
    <div>
      <h1>Quản lý Reviews</h1>
      <button onClick={fetchAllReviews} disabled={loading}>
        {loading ? 'Loading...' : 'Getting all reviews'}
      </button>
      <button onClick={fetchLowReviews} disabled={loading} style={{ marginLeft: '8px' }}>
        {loading ? 'Loading...' : 'Get Low Rating Reviews (≤2)'}
      </button>
      <button onClick={fetchHighReviews} disabled={loading} style={{ marginLeft: '8px' }}>
        {loading ? 'Loading...' : 'Get High Rating Reviews (≥4)'}
      </button>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter keyword..."
        style={{ marginLeft: '8px', padding: '4px' }}
        />
        <button onClick={fetchSearch} disabled={loading} style={{ marginLeft: '8px' }}>
        {loading ? 'Loading...' : 'Search Reviews'}
      </button>



      {error && <p className="text-red-500">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Content</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review.id}>
              <td>{review.id}</td>
              <td>{review.content}</td>
              <td>{review.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReview;
