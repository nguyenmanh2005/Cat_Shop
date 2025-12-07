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
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  Star,
  Clock,
  Target
} from "lucide-react";

const About = () => {
  useEffect(() => {
    document.title = "Giới thiệu - Cham Pets";
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Yêu thương tận tâm",
      description: "Chúng tôi đặt tình yêu và sự chăm sóc lên hàng đầu cho từng chú mèo"
    },
    {
      icon: Shield,
      title: "Sức khỏe đảm bảo",
      description: "Tất cả mèo đều được kiểm tra sức khỏe và tiêm phòng đầy đủ"
    },
    {
      icon: Award,
      title: "Chất lượng cao",
      description: "Chỉ cung cấp những chú mèo thuần chủng, khỏe mạnh và đẹp nhất"
    },
    {
      icon: Users,
      title: "Đội ngũ chuyên nghiệp",
      description: "Được tư vấn bởi các chuyên gia có nhiều năm kinh nghiệm"
    }
  ];

  const services = [
    "Tư vấn chọn mèo phù hợp",
    "Kiểm tra sức khỏe miễn phí",
    "Hướng dẫn chăm sóc chi tiết",
    "Bảo hành sức khỏe 30 ngày",
    "Hỗ trợ 24/7 sau khi mua",
    "Giao hàng tận nơi an toàn"
  ];

  const stats = [
    { number: "500+", label: "Mèo đã tìm được nhà" },
    { number: "1000+", label: "Khách hàng hài lòng" },
    { number: "5+", label: "Năm kinh nghiệm" },
    { number: "98%", label: "Tỷ lệ hài lòng" }
  ];

  const testimonials = [
    {
      name: "Chị Nguyễn Thị Mai",
      location: "TP.HCM",
      rating: 5,
      comment: "Mèo Bengal tôi mua từ Cham Pets rất khỏe mạnh và đẹp. Dịch vụ chăm sóc rất tận tâm!"
    },
    {
      name: "Anh Trần Văn Nam",
      location: "Hà Nội", 
      rating: 5,
      comment: "Cảm ơn Cham Pets đã giúp tôi tìm được chú mèo Persian hoàn hảo. Giao hàng nhanh và an toàn."
    },
    {
      name: "Chị Lê Thị Hoa",
      location: "Đà Nẵng",
      rating: 5,
      comment: "Đội ngũ tư vấn rất chuyên nghiệp, giúp tôi chọn được mèo phù hợp với gia đình."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
      <Header />
      
      <main className="flex-1 animate-fade-in">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 animate-fade-in-down">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Về Cham Pets
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Chuyên cung cấp mèo cảnh chất lượng cao với sự chăm sóc tận tâm và yêu thương vô điều kiện
              </p>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Câu chuyện của chúng tôi
                </h2>
                <p className="text-muted-foreground mb-6">
                  Cham Pets được thành lập với tình yêu đặc biệt dành cho những chú mèo cảnh. 
                  Chúng tôi tin rằng mỗi chú mèo đều xứng đáng được yêu thương và chăm sóc trong 
                  một môi trường tốt nhất.
                </p>
                <p className="text-muted-foreground mb-6">
                  Với hơn 5 năm kinh nghiệm trong việc chăm sóc và cung cấp mèo cảnh, chúng tôi 
                  tự hào là địa chỉ tin cậy của hàng nghìn khách hàng trên khắp Việt Nam.
                </p>
                <div className="flex items-center gap-4">
                  <Button size="lg">
                    Khám phá mèo cảnh
                  </Button>
                  <Button variant="outline" size="lg">
                    Liên hệ chúng tôi
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">500+</div>
                      <div className="text-sm text-muted-foreground">Mèo đã tìm được nhà</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">5+</div>
                      <div className="text-sm text-muted-foreground">Năm kinh nghiệm</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4 mt-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                      <div className="text-sm text-muted-foreground">Khách hàng hài lòng</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">98%</div>
                      <div className="text-sm text-muted-foreground">Tỷ lệ hài lòng</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Tại sao chọn Cham Pets?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card 
                      key={index} 
                      className="text-center card-hover animate-fade-in-up group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                          <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Services */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Dịch vụ của chúng tôi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Dịch vụ chính
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Cam kết chất lượng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Mèo thuần chủng, khỏe mạnh</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Bảo hành sức khỏe 30 ngày</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Hỗ trợ 24/7 sau khi mua</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Giao hàng tận nơi an toàn</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Khách hàng nói gì về chúng tôi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <Card 
                    key={index} 
                    className="card-hover animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">
                        "{testimonial.comment}"
                      </p>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-center text-foreground mb-8">
                Liên hệ với chúng tôi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Điện thoại</h3>
                  <p className="text-muted-foreground">0911.079.086</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">info@champets.com</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Địa chỉ</h3>
                  <p className="text-muted-foreground">123 Đường ABC, Quận XYZ, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
