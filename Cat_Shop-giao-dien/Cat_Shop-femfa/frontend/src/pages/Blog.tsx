import { useEffect, useState, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.title = "Blog - Cham Pets";
  }, []);

  const blogPosts = [
    {
      id: 1,
      title: "How to Properly Care for Bengal Cats",
      excerpt: "Bengal cats are a special breed with beautiful leopard-like fur. Let's learn how to care for them in the best way.",
      content: "Bengal cats are a hybrid breed between domestic cats and Asian leopard cats...",
      author: "Dr. Nguyen Van A",
      publishDate: "2024-01-15",
      readTime: "5 min",
      views: 1250,
      likes: 89,
      comments: 12,
      category: "Care",
      tags: ["Bengal", "Care", "Pet Cats"],
      image: "/src/assets/pet1.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Top 10 Most Popular Pet Cat Breeds in Vietnam",
      excerpt: "Discover the most loved pet cat breeds in Vietnam and the characteristics of each breed.",
      content: "Vietnam has more and more people who love pet cats...",
      author: "Cat Expert",
      publishDate: "2024-01-12",
      readTime: "8 min",
      views: 2100,
      likes: 156,
      comments: 23,
      category: "Breeds",
      tags: ["Cat Breeds", "Popular", "Vietnam"],
      image: "/src/assets/pet2.jpg",
      featured: false
    },
    {
      id: 3,
      title: "How to Choose the Right Food for Kittens",
      excerpt: "Choosing the right food for kittens is very important to ensure healthy development.",
      content: "Kittens have special nutritional needs different from adult cats...",
      author: "Veterinarian",
      publishDate: "2024-01-10",
      readTime: "6 min",
      views: 980,
      likes: 67,
      comments: 8,
      category: "Nutrition",
      tags: ["Food", "Kittens", "Nutrition"],
      image: "/src/assets/pet3.jpg",
      featured: false
    },
    {
      id: 4,
      title: "Signs of Cat Illness and How to Handle It",
      excerpt: "Knowing how to recognize signs of illness in cats will help you take better care of your pet.",
      content: "Cats are very good at hiding signs of illness...",
      author: "Dr. Tran Thi B",
      publishDate: "2024-01-08",
      readTime: "7 min",
      views: 1580,
      likes: 112,
      comments: 15,
      category: "Health",
      tags: ["Illness", "Health", "Care"],
      image: "/src/assets/pet4.jpg",
      featured: true
    },
    {
      id: 5,
      title: "How to Train Cats to Use Litter Box",
      excerpt: "Detailed guide on how to effectively train kittens to use the litter box.",
      content: "Training cats to use the litter box is one of the first lessons...",
      author: "Behavior Expert",
      publishDate: "2024-01-05",
      readTime: "4 min",
      views: 750,
      likes: 45,
      comments: 6,
      category: "Training",
      tags: ["Training", "Litter Box", "Kittens"],
      image: "/src/assets/pet1.jpg",
      featured: false
    },
    {
      id: 6,
      title: "Vaccination Schedule for Cats by Age",
      excerpt: "Detailed information about the necessary vaccination schedule for cats from young to adult.",
      content: "Vaccination is an important part of cat health care...",
      author: "Veterinary Clinic",
      publishDate: "2024-01-03",
      readTime: "9 min",
      views: 1350,
      likes: 98,
      comments: 11,
      category: "Health",
      tags: ["Vaccination", "Health", "Schedule"],
      image: "/src/assets/pet2.jpg",
      featured: false
    }
  ];

  const categories = ["All", "Care", "Breeds", "Nutrition", "Health", "Training"];
  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 3);

  // Filter blog posts based on search term and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      // Filter by search term (title, excerpt, content, tags)
      const matchesSearch = 
        searchTerm === "" ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filter by category
      const matchesCategory = 
        selectedCategory === "all" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, blogPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden page-transition">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Cham Pets Blog
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover useful knowledge about pet cat care from experts
              </p>
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-foreground mb-8">Featured Posts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <Card 
                  key={post.id} 
                  className="overflow-hidden card-hover animate-fade-in-up gpu-accelerated"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden group">
                    <img 
                      src={post.image || "/placeholder.svg"} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary animate-pulse">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.publishDate)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
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
                      <Button variant="ghost" size="sm" className="hover-lift">
                        Read More <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
                     placeholder="Search posts..."
                     className="pl-10"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                   />
                 </div>
               </div>
               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                 <SelectTrigger className="w-full md:w-48">
                   <SelectValue placeholder="Select category" />
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
                 <h2 className="text-2xl font-bold text-foreground mb-6">
                   All Posts {filteredPosts.length !== blogPosts.length && `(${filteredPosts.length})`}
                 </h2>
                 {filteredPosts.length === 0 ? (
                   <div className="text-center py-12">
                     <p className="text-muted-foreground text-lg">No posts found</p>
                     <p className="text-sm text-muted-foreground mt-2">
                       Try searching with different keywords or select a different category
                     </p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            <img 
                              src={post.image || "/placeholder.svg"} 
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
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
                                Read More
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Posts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Posts</CardTitle>
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
                    <CardTitle>Categories</CardTitle>
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
                    <CardTitle>Popular Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {["Care", "Pet Cats", "Health", "Nutrition", "Bengal", "Persian", "Training"].map((tag) => (
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
