import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import PetGrid from "@/components/PetGrid";

const Pets = () => {
  useEffect(() => {
    document.title = "Mèo cảnh - Cham Pets";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex flex-1">
        <Sidebar />
        <PetGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Pets;
