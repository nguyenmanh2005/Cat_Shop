import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PetGrid from "@/components/PetGrid";

const CatFood = () => {
  useEffect(() => {
    document.title = "Thức ăn cho mèo - Cham Pets";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <PetGrid />
      </main>
      <Footer />
    </div>
  );
};

export default CatFood;