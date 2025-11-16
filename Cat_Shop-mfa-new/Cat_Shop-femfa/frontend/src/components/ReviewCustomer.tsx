import React, { useState } from 'react';
import axios from 'axios';

interface CreateReviewPayload {
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
}

const ReviewCustomer: React.FC = () => {
  const [reviewId, setReviewId] = useState<number | ''>('');
  const [userId, setUserId] = useState<number | ''>('');
  const [productId, setProductId] = useState<number | ''>('');
  const [rating, setRating] = useState<number | ''>('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validate = () => {
    if (typeof userId !== 'number' || typeof productId !== 'number' || typeof rating !== 'number') {
      setMessage({ type: 'error', text: 'Please fill in User ID, Product ID and Rating.' });
      return false;
    }
    if (rating < 1 || rating > 5) {
      setMessage({ type: 'error', text: 'Rating must be between 1 and 5.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    const payload: CreateReviewPayload = {
      userId: Number(userId),
      productId: Number(productId),
      rating: Number(rating),
      comment: comment.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await axios.post('http://localhost:8080/api/reviews', payload);
      setMessage({ type: 'success', text: 'Review created successfully.' });
      // Optional: reset form
      setRating('');
      setComment('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to create review. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setMessage(null);

    if (typeof reviewId !== 'number') {
      setMessage({ type: 'error', text: 'Please provide Review ID to update.' });
      return;
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      setMessage({ type: 'error', text: 'Rating must be a number between 1 and 5.' });
      return;
    }

    const payload: CreateReviewPayload = {
      userId: typeof userId === 'number' ? userId : 0,
      productId: typeof productId === 'number' ? productId : 0,
      rating: Number(rating),
      comment: comment.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await axios.put(`http://localhost:8080/api/reviews/${reviewId}`, payload);
      setMessage({ type: 'success', text: `Review ${reviewId} updated successfully.` });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update review. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setMessage(null);

    if (typeof reviewId !== 'number') {
      setMessage({ type: 'error', text: 'Please provide Review ID to delete.' });
      return;
    }

    setSubmitting(true);
    try {
      await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`);
      setMessage({ type: 'success', text: `Review ${reviewId} deleted successfully.` });
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete review. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create Review</h1>

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
          <label className="block text-sm font-medium mb-1">Review ID (for update)</label>
          <input
            type="number"
            value={reviewId}
            onChange={(e) => setReviewId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter Review ID to update (optional for create)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">User ID</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter your User ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product ID</label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter Product ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Give a rating from 1 to 5"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            placeholder="Write your comment (optional)"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="ml-2 px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Review'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? 'Deleting...' : 'Delete Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewCustomer;


