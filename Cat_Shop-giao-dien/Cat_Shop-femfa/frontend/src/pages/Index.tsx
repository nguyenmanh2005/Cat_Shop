import { useEffect, useState, useLayoutEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
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
import { productService } from "@/services/productService";
import { Product } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import gsap from "gsap";
import { useGsapReveal } from "@/hooks/useGsapReveal";
import ContactFloatingButtons from "@/components/ContactFloatingButtons";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const revealScope = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!heroRef.current) return;

    // Dùng gsap.context để cleanup gọn hơn với React 18
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: 0.9, ease: "power3.out" }
      });

      tl.from(".hero-title", { y: 40, opacity: 0 })
        .from(".hero-subtitle", { y: 30, opacity: 0 }, "-=0.6")
        .from(".hero-buttons", { y: 20, opacity: 0, scale: 0.95 }, "-=0.6");

      // Hiệu ứng nhịp nhè nhẹ cho chữ Cham Pets
      gsap.to(".hero-brand", {
        y: -4,
        scale: 1.04,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 1.6
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useGsapReveal(revealScope);

  useEffect(() => {
    document.title = "Cham Pets - Care and Love for Pet Cats";
    
    // SEO meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Cham Pets - Specializing in high-quality pet cats, dedicated care and unconditional love. Discover our adorable collection of pet cats.');
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Cham Pets - Care and Love for Pet Cats');
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', 'Cham Pets - Specializing in high-quality pet cats, dedicated care and unconditional love.');
    }

    // Load featured products based on login status
    loadFeaturedProducts();
  }, [isAuthenticated]);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      if (!isAuthenticated) {
        setFeaturedProducts([]);
        return;
      }
      const products = await productService.getAllProductsCustomer();
      // Get first 8 products to display
      setFeaturedProducts(products.slice(0, 8));
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Caring with Love",
      description: "We put love and care first for every cat"
    },
    {
      icon: Shield,
      title: "Health Guaranteed",
      description: "All cats are health checked and fully vaccinated"
    },
    {
      icon: Award,
      title: "High Quality",
      description: "Only providing purebred, healthy and most beautiful cats"
    },
    {
      icon: Users,
      title: "Professional Team",
      description: "Consulted by experts with years of experience"
    }
  ];

  const services = [
    "Consultation for choosing the right cat",
    "Free health check",
    "Detailed care guide",
    "30-day health warranty",
    "24/7 support after purchase",
    "Safe home delivery"
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header />
      
      <main className="flex-1" ref={revealScope}>
        {/* Hero Section */}
        <section 
          className="relative py-20 bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage: `url('https://img.freepik.com/premium-photo/british-cat-with-shopping-cart-isolated-white-kitten-osolated_767502-1922.jpg')`,
            backgroundSize: 'auto',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50 animate-gradient"></div>
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 z-10" ref={heroRef}>
            <div className="text-center">
              <h1 className="hero-title text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Welcome to{" "}
                <span className="hero-brand text-primary">
                  Cham Pets
                </span>
              </h1>
              <p className="hero-subtitle text-xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-md">
                Specializing in high-quality pet cats with dedicated care and unconditional love
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pets">
                  <Button size="lg" className="w-full sm:w-auto hover-lift hover-glow transition-bounce">
                    Explore Pet Cats <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover-lift transition-all">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12" data-anim="fade">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose Cham Pets?
              </h2>
              <p className="text-muted-foreground">
                We are committed to bringing you the best pet cats
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card 
                    key={feature.title} 
                    className="text-center hover-lift transition-smooth group"
                    data-anim="fade"
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
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12" data-anim="fade">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Discover our most popular products
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-lg text-muted-foreground animate-pulse">Loading products...</div>
                </div>
              </div>
            ) : !isAuthenticated ? (
              <div className="flex justify-center items-center h-64 animate-fade-in">
                <div className="text-lg text-muted-foreground">Please login to view products</div>
              </div>
            ) : featuredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {featuredProducts.map((product) => (
                    <div 
                      key={product.productId}
                      data-anim="fade"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                <div className="text-center" data-anim="fade">
                  <Link to="/pets">
                    <Button size="lg" variant="outline" className="hover-lift transition-bounce">
                      View All Products <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64 animate-fade-in">
                <div className="text-lg text-muted-foreground">No products available</div>
              </div>
            )}
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div data-anim="fade">
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Our Services
                </h2>
                <p className="text-muted-foreground mb-6">
                  Cham Pets provides comprehensive services from consultation, cat selection to post-purchase care.
                </p>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service} className="flex items-center gap-3" data-anim="fade">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link to="/about">
                    <Button>
                      Learn More About Us <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "500+", label: "Cats Found Homes" },
                  { value: "1000+", label: "Satisfied Customers" },
                  { value: "5+", label: "Years of Experience" },
                  { value: "98%", label: "Satisfaction Rate" }
                ].map((stat, index) => (
                  <Card 
                    key={stat.label}
                    className="text-center hover-lift transition-smooth group"
                    data-anim="fade"
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-primary rounded-lg p-8 text-center relative overflow-hidden" data-anim="fade">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                  Ready to Find Your Perfect Cat Companion?
                </h2>
                <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                  Explore our adorable collection of pet cats and find the ideal companion for your family.
                </p>
                <Link to="/pets">
                  <Button size="lg" variant="secondary" className="hover-lift hover-glow transition-bounce">
                    View All Pet Cats <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ContactFloatingButtons />
    </div>
  );
};

export default Index;
