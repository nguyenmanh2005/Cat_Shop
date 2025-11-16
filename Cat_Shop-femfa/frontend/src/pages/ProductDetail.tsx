import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatDetailView from "@/components/CatDetailView";

const ProductDetail = () => {
  useEffect(() => {
    document.title = "Chi tiết sản phẩm - Cham Pets";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <CatDetailView />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
