import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border animate-fade-in page-transition">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Logo and Social Media */}
          <div className="space-y-6 animate-fade-in-left">
            {/* Logo */}
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center group-hover:bg-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-background font-bold text-lg group-hover:text-primary-foreground transition-colors">CP</span>
              </div>
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">Cham Pets</span>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {[
                { icon: "twitter", label: "Twitter" },
                { icon: "instagram", label: "Instagram", component: Instagram },
                { icon: "youtube", label: "YouTube", component: Youtube },
                { icon: "linkedin", label: "LinkedIn", component: Linkedin }
              ].map((social, index) => {
                const IconComponent = social.component;
                return (
                  <a 
                    key={social.icon}
                    href="#" 
                    className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center hover:bg-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover-glow group"
                    aria-label={social.label}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-4 h-4 text-background group-hover:text-primary-foreground transition-colors" />
                    ) : (
                      <svg className="w-4 h-4 text-background group-hover:text-primary-foreground transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Middle Column - Website Information */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-foreground uppercase">
              THÔNG TIN WEBSITE
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: "Chủ sở hữu:", value: "Công ty TNHH Cham Pets" },
                { label: "Mã số thuế:", value: "0123456789" },
                { label: "Địa chỉ:", value: "123 Đường ABC, Quận XYZ, TP.HCM" },
                { label: "Điện thoại:", value: "0123 456 789" }
              ].map((info, index) => (
                <div key={index} className="hover:text-foreground transition-colors duration-300">
                  <span className="font-medium">{info.label}</span>
                  <span className="ml-2">{info.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Policy Information */}
          <div className="space-y-4 animate-fade-in-right" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-bold text-foreground uppercase">
              THÔNG TIN CHÍNH SÁCH
            </h3>
            <div className="space-y-2 text-sm">
              {[
                "Chính sách bảo mật",
                "Điều khoản dịch vụ",
                "Điều kiện giao dịch",
                "Hàng hóa",
                "Dịch vụ",
                "Vận chuyển",
                "Đổi trả"
              ].map((policy, index) => (
                <a 
                  key={policy}
                  href="#" 
                  className="block text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {policy}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="mt-8 pt-6 border-t border-border animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Cham Pets. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
