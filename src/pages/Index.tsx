import { useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PetGrid from "@/components/PetGrid";

const Index = () => {
  useEffect(() => {
    document.title = "Cham Pets - Chăm sóc và yêu thương thú cưng";
    
    // SEO meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Cham Pets - Chuyên cung cấp thú cưng chất lượng cao, dịch vụ chăm sóc và yêu thương thú cưng tận tâm. Khám phá bộ sưu tập thú cưng đáng yêu của chúng tôi.');
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Cham Pets - Chăm sóc và yêu thương thú cưng');
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Cham Pets - Chuyên cung cấp thú cưng chất lượng cao, dịch vụ chăm sóc và yêu thương thú cưng tận tâm.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex">
        <Sidebar />
        <PetGrid />
      </main>
    </div>
  );
};

export default Index;
