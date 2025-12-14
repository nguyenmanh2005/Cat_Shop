import React, { useState, useEffect } from 'react';
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

interface PublicReviewProps {
  productId: number;
}

const PublicReview: React.FC<PublicReviewProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const fetchProductReviews = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const resp = await axios.get(`/api/reviews/product/${productId}`);
      const data = (resp.data?.data ?? resp.data) as ReviewItem[];
      setReviews(Array.isArray(data) ? data : []);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage('Chưa có đánh giá nào cho sản phẩm này.');
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách đánh giá.';
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductReviews();
  }, [productId]);

  const averageRating = calculateAverageRating();
  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Đánh Giá Sản Phẩm</h1>
        <button
          type="button"
          onClick={fetchProductReviews}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-gray-100 text-gray-700">{message}</div>
      )}

      {/* Average Rating Summary */}
      {!loading && reviews.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6 mb-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-6 h-6 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">{totalReviews} đánh giá</div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-8 text-gray-600">{rating} ⭐</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${totalReviews > 0 ? (distribution[rating as keyof typeof distribution] / totalReviews) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm w-12 text-gray-600 text-right">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border divide-y">
          {reviews.map((r) => (
            <div key={r.review_id ?? Math.random()} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= r.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700">{r.rating}/5</span>
                </div>
                <div className="text-sm text-gray-500">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Người đánh giá: <span className="font-medium">{r.user?.username || `User #${r.user_id}` || 'Ẩn danh'}</span>
              </div>
              {r.product_id && (
                <div className="text-sm text-gray-500 mb-2">
                  Sản phẩm: <span className="font-medium">#{r.product_id}</span>
                </div>
              )}
              {r.comment && (
                <p className="mt-3 text-gray-800 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && !message && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          Chưa có đánh giá nào
        </div>
      )}
    </div>
  );
};

export default PublicReview;
