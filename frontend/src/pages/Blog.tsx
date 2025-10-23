import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Calendar, 
  User, 
  Eye, 
  Heart,
  MessageCircle,
  Tag,
  Clock,
  ArrowRight
} from "lucide-react";

const Blog = () => {
  useEffect(() => {
    document.title = "Blog - Cham Pets";
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: "Hướng dẫn chăm sóc mèo Bengal đúng cách",
      excerpt: "Mèo Bengal là một giống mèo đặc biệt với bộ lông đẹp như báo. Hãy cùng tìm hiểu cách chăm sóc chúng một cách tốt nhất.",
      content: "Mèo Bengal là một giống mèo lai giữa mèo nhà và mèo báo châu Á...",
      author: "Dr. Nguyễn Văn A",
      publishDate: "2024-01-15",
      readTime: "5 phút",
      views: 1250,
      likes: 89,
      comments: 12,
      category: "Chăm sóc",
      tags: ["Bengal", "Chăm sóc", "Mèo cảnh"],
      image: "/src/assets/pet1.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Top 10 giống mèo cảnh phổ biến nhất tại Việt Nam",
      excerpt: "Khám phá những giống mèo cảnh được yêu thích nhất tại Việt Nam và đặc điểm của từng giống.",
      content: "Việt Nam ngày càng có nhiều người yêu thích mèo cảnh...",
      author: "Chuyên gia Mèo",
      publishDate: "2024-01-12",
      readTime: "8 phút",
      views: 2100,
      likes: 156,
      comments: 23,
      category: "Giống mèo",
      tags: ["Giống mèo", "Phổ biến", "Việt Nam"],
      image: "/src/assets/pet2.jpg",
      featured: false
    },
    {
      id: 3,
      title: "Cách chọn thức ăn phù hợp cho mèo con",
      excerpt: "Chọn thức ăn đúng cho mèo con là rất quan trọng để đảm bảo sự phát triển khỏe mạnh.",
      content: "Mèo con có nhu cầu dinh dưỡng đặc biệt khác với mèo trưởng thành...",
      author: "Bác sĩ thú y",
      publishDate: "2024-01-10",
      readTime: "6 phút",
      views: 980,
      likes: 67,
      comments: 8,
      category: "Dinh dưỡng",
      tags: ["Thức ăn", "Mèo con", "Dinh dưỡng"],
      image: "/src/assets/pet3.jpg",
      featured: false
    },
    {
      id: 4,
      title: "Dấu hiệu nhận biết mèo bị bệnh và cách xử lý",
      excerpt: "Biết cách nhận biết các dấu hiệu bệnh ở mèo sẽ giúp bạn chăm sóc thú cưng tốt hơn.",
      content: "Mèo thường che giấu các dấu hiệu bệnh tật rất tốt...",
      author: "Dr. Trần Thị B",
      publishDate: "2024-01-08",
      readTime: "7 phút",
      views: 1580,
      likes: 112,
      comments: 15,
      category: "Sức khỏe",
      tags: ["Bệnh tật", "Sức khỏe", "Chăm sóc"],
      image: "/src/assets/pet4.jpg",
      featured: true
    },
    {
      id: 5,
      title: "Cách huấn luyện mèo sử dụng cát vệ sinh",
      excerpt: "Hướng dẫn chi tiết cách huấn luyện mèo con sử dụng cát vệ sinh một cách hiệu quả.",
      content: "Huấn luyện mèo sử dụng cát vệ sinh là một trong những bài học đầu tiên...",
      author: "Chuyên gia hành vi",
      publishDate: "2024-01-05",
      readTime: "4 phút",
      views: 750,
      likes: 45,
      comments: 6,
      category: "Huấn luyện",
      tags: ["Huấn luyện", "Cát vệ sinh", "Mèo con"],
      image: "/src/assets/pet1.jpg",
      featured: false
    },
    {
      id: 6,
      title: "Lịch tiêm phòng cho mèo theo từng độ tuổi",
      excerpt: "Thông tin chi tiết về lịch tiêm phòng cần thiết cho mèo từ khi còn nhỏ đến khi trưởng thành.",
      content: "Tiêm phòng là một phần quan trọng trong việc chăm sóc sức khỏe mèo...",
      author: "Phòng khám thú y",
      publishDate: "2024-01-03",
      readTime: "9 phút",
      views: 1350,
      likes: 98,
      comments: 11,
      category: "Sức khỏe",
      tags: ["Tiêm phòng", "Sức khỏe", "Lịch trình"],
      image: "/src/assets/pet2.jpg",
      featured: false
    }
  ];

  const categories = ["Tất cả", "Chăm sóc", "Giống mèo", "Dinh dưỡng", "Sức khỏe", "Huấn luyện"];
  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Blog Cham Pets
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Khám phá những kiến thức hữu ích về chăm sóc mèo cảnh từ các chuyên gia
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-8">Bài viết nổi bật</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-muted-foreground">Hình ảnh bài viết</div>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-primary">
                      Nổi bật
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.publishDate)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Đọc thêm <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-8 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm bài viết..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-foreground mb-6">Tất cả bài viết</h2>
                <div className="space-y-6">
                  {blogPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                            <div className="text-muted-foreground text-xs">Hình ảnh</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline">{post.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(post.publishDate)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {post.author}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {post.readTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {post.views}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                Đọc thêm
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bài viết gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPosts.map((post) => (
                        <div key={post.id} className="flex gap-3">
                          <div className="w-16 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <div className="text-muted-foreground text-xs">IMG</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2 mb-1">
                              {post.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(post.publishDate)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Danh mục</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.slice(1).map((category) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {blogPosts.filter(post => post.category === category).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags phổ biến</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {["Chăm sóc", "Mèo cảnh", "Sức khỏe", "Dinh dưỡng", "Bengal", "Persian", "Huấn luyện"].map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
