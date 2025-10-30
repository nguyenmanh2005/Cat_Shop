import { useEffect, useState } from "react";
import productApi from "../api/productApi";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll();
        // Backend thường trả về { data: [...] } hoặc { data: { data: [...] } }
        setProducts(res.data.data || res.data);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải sản phẩm...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
      {products.map((p) => (
        <div
          key={p.productId}
          className="border rounded-lg shadow hover:shadow-lg transition p-3"
        >
          <img
            src={p.imageUrl || "https://placehold.co/200x200"}
            alt={p.productName}
            className="w-full h-40 object-cover rounded"
          />
          <h3 className="mt-2 font-semibold">{p.productName}</h3>
          <p className="text-gray-600">{p.price} VNĐ</p>
        </div>
      ))}
    </div>
  );
}
