import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { productService } from '../services/productService';
import { Product } from '../types';

interface FoodDetail { foodId: number; weightKg: number; ingredients: string; expiryDate: string; }
interface PaginatedResponse { content: FoodDetail[]; totalPages: number; number: number; }
interface SortConfig { field: 'expiryDate' | 'weightKg' | 'ingredients'; direction: 'asc' | 'desc'; }

const FoodDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [foodDetails, setFoodDetails] = useState<FoodDetail | null>(null);
  const [allFoodDetails, setAllFoodDetails] = useState<FoodDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [edit, setEdit] = useState({ weight: '', ingredients: '', expiry: '' });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SortConfig>({ field: 'expiryDate', direction: 'asc' });
  const [search, setSearch] = useState(''), [expiry, setExpiry] = useState('');
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => { if (id) productService.getProductById(+id).then(setProduct).finally(() => setLoading(false)); }, [id]);
  useEffect(() => {
    if (!id || product?.type_id !== 2) return;
    setLoading(true);
    axios.get(`/api/admin/food-details/${id}`).then(r => {
      const d = r.data?.data || r.data; setFoodDetails(d);
      setEdit({ weight: d.weightKg ?? '', ingredients: d.ingredients ?? '', expiry: d.expiryDate?.slice(0, 10) ?? '' });
    }).catch(() => toast({ title: 'Error', description: 'Failed to load food details', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [id, product]);

  const fetchList = async (p = page) => {
    setLoadingList(true);
    try {
      const r = await axios.get<PaginatedResponse>(`/api/admin/food-details?page=${p}&size=5&sort=${sort.field},${sort.direction}`);
      setAllFoodDetails(r.data.content); setTotal(r.data.totalPages); setPage(r.data.number);
    } catch { toast({ title: 'Error', description: 'Failed to load list', variant: 'destructive' }); }
    setLoadingList(false);
  };
  useEffect(() => { fetchList(); }, [page, sort]);

  const saveFood = async () => {
    if (!product) return; setSaving(true);
    axios.post('/api/admin/food-details', { foodId: product.product_id, weightKg: 1, ingredients: 'Default', expiryDate: '2025-12-31' })
      .then(r => { const d = r.data.data; setFoodDetails(d); setEdit({ weight: d.weightKg, ingredients: d.ingredients, expiry: d.expiryDate.slice(0, 10) }); toast({ title: 'Success', description: 'Saved' }); })
      .catch(() => toast({ title: 'Error', description: 'Save failed', variant: 'destructive' }))
      .finally(() => setSaving(false));
  };

  const updateFood = async () => {
    if (!foodDetails) return; setSaving(true);
    axios.put(`/api/admin/food-details/${foodDetails.foodId}`, { foodId: foodDetails.foodId, weightKg: +edit.weight || 0, ingredients: edit.ingredients, expiryDate: edit.expiry })
      .then(r => { setFoodDetails(r.data.data || r.data); toast({ title: 'Success', description: 'Updated' }); })
      .catch(() => toast({ title: 'Error', description: 'Update failed', variant: 'destructive' }))
      .finally(() => setSaving(false));
  };

  const delFood = async (id: number) => {
    if (!confirm('Delete?')) return; setSaving(true);
    axios.delete(`/api/admin/food-details/${id}`).then(() => { fetchList(); toast({ title: 'Success', description: 'Deleted' }); })
      .catch(() => toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' }))
      .finally(() => setSaving(false));
  };

  const searchFilter = async () => {
    if (!search && !expiry) return fetchList(0);
    const params = []; if (search) params.push(`ingredients=${encodeURIComponent(search)}`); if (expiry) params.push(`expiryBefore=${encodeURIComponent(expiry)}`);
    axios.get<FoodDetail[]>(`/api/admin/food-details/search-filter?${params.join('&')}`).then(r => { setAllFoodDetails(r.data); setTotal(0); toast({ title: 'Done', description: `Found ${r.data.length}` }); });
  };

  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div></div>;
  if (!product) return <div className="text-center py-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <img src={product.image_url || '/placeholder-food.png'} alt={product.product_name} className="md:w-1/2 w-full rounded-lg shadow-lg object-cover aspect-square" />
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
          <p className="text-2xl text-primary mb-4">${product.price.toFixed(2)}</p>
          <p className="mb-6">{product.description || 'No description'}</p>

          {product.type_id === 2 && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              {foodDetails ? (
                <div className="space-y-4">
                  <input type="number" step="0.1" value={edit.weight} onChange={e => setEdit({ ...edit, weight: e.target.value })} className="w-40 px-3 py-2 border rounded-md" />
                  <textarea value={edit.ingredients} onChange={e => setEdit({ ...edit, ingredients: e.target.value })} className="w-full px-3 py-2 border rounded-md" rows={3} />
                  <input type="date" value={edit.expiry} onChange={e => setEdit({ ...edit, expiry: e.target.value })} className="px-3 py-2 border rounded-md" />
                  <div className="flex gap-2">
                    <button onClick={updateFood} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-md">{saving ? 'Saving...' : 'Update'}</button>
                    <button onClick={() => setEdit({ weight: foodDetails.weightKg.toString(), ingredients: foodDetails.ingredients, expiry: foodDetails.expiryDate.slice(0, 10) })} className="px-4 py-2 border rounded-md">Cancel</button>
                    <button onClick={() => delFood(foodDetails.foodId)} disabled={saving} className="px-4 py-2 bg-red-600 text-white rounded-md">{saving ? '...' : 'Delete'}</button>
                  </div>
                </div>
              ) : (
                <button onClick={saveFood} disabled={saving} className="text-primary">{saving ? 'Saving...' : 'Add Food Details'}</button>
              )}
            </div>
          )}

          {product.stock_quantity > 0 && (
            <>
              <input type="number" min="1" max={product.stock_quantity} value={quantity} onChange={e => setQuantity(+e.target.value)} className="w-20 px-3 py-2 border rounded-md mb-4" />
              <button onClick={() => toast({ title: 'Added', description: `${quantity} ${product.product_name}` })} className="bg-primary text-white px-6 py-3 rounded-lg">Add to Cart</button>
            </>
          )}
        </div>
      </div>

      <div className="mt-12 bg-white p-4 rounded-md">
        <div className="flex gap-2 mb-4">
          <input placeholder="Search ingredients" value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded-md" />
          <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} className="px-3 py-2 border rounded-md" />
          <button onClick={searchFilter} className="px-4 py-2 bg-primary text-white rounded-md">Search & Filter</button>
          <button onClick={() => { setSearch(''); setExpiry(''); fetchList(0); }} className="px-3 py-2 border rounded-md">Clear</button>
        </div>
        {loadingList ? <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div></div> :
          <table className="min-w-full divide-y divide-gray-200">
            <thead><tr>{['Weight (kg)', 'Ingredients', 'Expiry Date', 'Actions'].map((h, i) =>
              <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => h.includes('Weight') ? setSort({ field: 'weightKg', direction: sort.direction === 'asc' ? 'desc' : 'asc' })
                  : h.includes('Ingredients') ? setSort({ field: 'ingredients', direction: sort.direction === 'asc' ? 'desc' : 'asc' })
                    : h.includes('Expiry') && setSort({ field: 'expiryDate', direction: sort.direction === 'asc' ? 'desc' : 'asc' })}>{h}</th>)}</tr></thead>
            <tbody>{allFoodDetails.map(d => <tr key={d.foodId}>
              <td className="px-6 py-4">{d.weightKg}</td>
              <td className="px-6 py-4">{d.ingredients}</td>
              <td className="px-6 py-4">{new Date(d.expiryDate).toLocaleDateString()}</td>
              <td className="px-6 py-4"><button onClick={() => setEdit({ weight: d.weightKg.toString(), ingredients: d.ingredients, expiry: d.expiryDate.slice(0, 10) })} className="text-indigo-600 mr-2">Edit</button>
                <button onClick={() => delFood(d.foodId)} className="text-red-600">Delete</button></td></tr>)}</tbody>
          </table>}
        {total > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setPage(0)} disabled={!page} className="px-3 py-1 border rounded">First</button>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={!page} className="px-3 py-1 border rounded">Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= total - 1} className="px-3 py-1 border rounded">Next</button>
            <button onClick={() => setPage(total - 1)} disabled={page >= total - 1} className="px-3 py-1 border rounded">Last</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDetails;
