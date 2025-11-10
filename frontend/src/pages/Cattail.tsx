import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatDetailView from "@/components/CatDetailView";

const Cattail = () => {
  useEffect(() => {
    document.title = "Chi tiết mèo cảnh - Cham Pets";
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

export default Cattail;