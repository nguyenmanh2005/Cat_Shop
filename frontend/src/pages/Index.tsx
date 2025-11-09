import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Shield, 
  Award, 
  Users,
  ArrowRight,
  CheckCircle,
  MessageCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  useEffect(() => {
    document.title = "Cham Pets - Chăm sóc và yêu thương mèo cảnh";
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Yêu thương tận tâm",
      description: "Chúng tôi đặt tình yêu và sự chăm sóc lên hàng đầu cho từng chú mèo",
    },
    {
      icon: Shield,
      title: "Sức khỏe đảm bảo",
      description: "Tất cả mèo đều được kiểm tra sức khỏe và tiêm phòng đầy đủ",
    },
    {
      icon: Award,
      title: "Chất lượng cao",
      description: "Chỉ cung cấp những chú mèo thuần chủng, khỏe mạnh và đẹp nhất",
    },
    {
      icon: Users,
      title: "Đội ngũ chuyên nghiệp",
      description: "Được tư vấn bởi các chuyên gia có nhiều năm kinh nghiệm",
    },
  ];

  const services = [
    "Tư vấn chọn mèo phù hợp",
    "Kiểm tra sức khỏe miễn phí",
    "Hướng dẫn chăm sóc chi tiết",
    "Bảo hành sức khỏe 30 ngày",
    "Hỗ trợ 24/7 sau khi mua",
    "Giao hàng tận nơi an toàn",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Chào mừng đến với <span className="text-primary">Cham Pets</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Chuyên cung cấp mèo cảnh chất lượng cao với sự chăm sóc tận tâm và yêu thương vô điều kiện
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pets">
                <Button size="lg" className="w-full sm:w-auto">
                  Khám phá mèo cảnh <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Tại sao chọn Cham Pets?
              </h2>
              <p className="text-muted-foreground">
                Chúng tôi cam kết mang đến những chú mèo cảnh tốt nhất cho bạn
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Dịch vụ của chúng tôi</h2>
              <p className="text-muted-foreground mb-6">
                Cham Pets cung cấp đầy đủ các dịch vụ từ tư vấn, chọn mèo đến chăm sóc sau khi mua.
              </p>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link to="/about">
                  <Button>
                    Tìm hiểu thêm về chúng tôi <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-primary rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Sẵn sàng tìm người bạn mèo hoàn hảo?
              </h2>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Khám phá bộ sưu tập mèo cảnh đáng yêu của chúng tôi và tìm người bạn đồng hành lý tưởng cho gia đình bạn.
              </p>
              <Link to="/pets">
                <Button size="lg" variant="secondary">
                  Xem tất cả mèo cảnh <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Liên hệ thanh toán qua Zalo */}
<section className="py-16 bg-primary text-primary-foreground text-center">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl font-bold mb-4 flex justify-center items-center gap-2">
      <span>💬</span> Liên hệ thanh toán qua Zalo
    </h2>
    <p className="mb-6 text-primary-foreground/90">
      Gửi tin nhắn trực tiếp đến <span className="font-semibold">chủ tiệm </span> qua Zalo
      để thanh toán hoặc được hỗ trợ nhanh nhất.
    </p>
    <a
      href="https://zalo.me/0866523966"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button
        size="lg"
        variant="secondary"
        className="bg-white text-primary hover:bg-white/90"
      >
        Chat Zalo ngay
      </Button>
    </a>
  </div>
</section>

      </main>

      <Footer />
    </div>
  );
};

export default Index;
