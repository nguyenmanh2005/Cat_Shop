import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Shield, 
  Award, 
  Users,
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Cham Pets - Chăm sóc và yêu thương mèo cảnh";
    
    // SEO meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Cham Pets - Chuyên cung cấp mèo cảnh chất lượng cao, dịch vụ chăm sóc và yêu thương mèo tận tâm. Khám phá bộ sưu tập mèo cảnh đáng yêu của chúng tôi.');
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Cham Pets - Chăm sóc và yêu thương mèo cảnh');
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Cham Pets - Chuyên cung cấp mèo cảnh chất lượng cao, dịch vụ chăm sóc và yêu thương mèo tận tâm.');
    }
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

export default Index;
