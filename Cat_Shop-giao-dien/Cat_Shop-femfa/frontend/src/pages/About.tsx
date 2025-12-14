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
    document.title = "About - Cham Pets";
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Loving Care",
      description: "We put love and care first for each cat"
    },
    {
      icon: Shield,
      title: "Health Guaranteed",
      description: "All cats are health checked and fully vaccinated"
    },
    {
      icon: Award,
      title: "High Quality",
      description: "Only providing purebred, healthy and beautiful cats"
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

  const stats = [
    { number: "500+", label: "Cats found homes" },
    { number: "1000+", label: "Satisfied customers" },
    { number: "5+", label: "Years of experience" },
    { number: "98%", label: "Satisfaction rate" }
  ];

  const testimonials = [
    {
      name: "Ms. Nguyen Thi Mai",
      location: "Ho Chi Minh City",
      rating: 5,
      comment: "The Bengal cat I bought from Cham Pets is very healthy and beautiful. The care service is very dedicated!"
    },
    {
      name: "Mr. Tran Van Nam",
      location: "Hanoi", 
      rating: 5,
      comment: "Thank you Cham Pets for helping me find the perfect Persian cat. Fast and safe delivery."
    },
    {
      name: "Ms. Le Thi Hoa",
      location: "Da Nang",
      rating: 5,
      comment: "The consulting team is very professional, helping me choose a cat suitable for my family."
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
                About Cham Pets
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Specializing in high-quality pet cats with dedicated care and unconditional love
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
                  Our Story
                </h2>
                <p className="text-muted-foreground mb-6">
                  Cham Pets was founded with a special love for pet cats. 
                  We believe that every cat deserves to be loved and cared for in 
                  the best environment.
                </p>
                <p className="text-muted-foreground mb-6">
                  With over 5 years of experience in caring for and providing pet cats, we 
                  are proud to be a trusted address for thousands of customers across Vietnam.
                </p>
                <div className="flex items-center gap-4">
                  <Button size="lg">
                    Explore Pet Cats
                  </Button>
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">500+</div>
                      <div className="text-sm text-muted-foreground">Cats found homes</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">5+</div>
                      <div className="text-sm text-muted-foreground">Years of experience</div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-4 mt-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                      <div className="text-sm text-muted-foreground">Satisfied Customers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-primary mb-2">98%</div>
                      <div className="text-sm text-muted-foreground">Satisfaction rate</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Why Choose Cham Pets?
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
                Our Services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Main Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
                      Quality Commitment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Purebred, healthy cats</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>30-day health warranty</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>24/7 support after purchase</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Safe home delivery</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                What Our Customers Say
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
                Contact Us
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Phone</h3>
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
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">123 ABC Street, XYZ District, Ho Chi Minh City</p>
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
