import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Logo and Social Media */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-lg">CP</span>
              </div>
              <span className="text-xl font-bold text-foreground">Cham Pets</span>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 text-background" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4 text-background" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-background" />
              </a>
            </div>
          </div>

          {/* Middle Column - Website Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground uppercase">
              THÔNG TIN WEBSITE
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Chủ sở hữu:</span>
                <span className="ml-2">Công ty TNHH Cham Pets</span>
              </div>
              <div>
                <span className="font-medium">Mã số thuế:</span>
                <span className="ml-2">0123456789</span>
              </div>
              <div>
                <span className="font-medium">Địa chỉ:</span>
                <span className="ml-2">123 Đường ABC, Quận XYZ, TP.HCM</span>
              </div>
              <div className="pt-2">
                <span className="font-medium">Điện thoại:</span>
                <span className="ml-2">0123 456 789</span>
              </div>
            </div>
          </div>

          {/* Right Column - Policy Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground uppercase">
              THÔNG TIN CHÍNH SÁCH
            </h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Điều kiện giao dịch
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Hàng hóa
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Dịch vụ
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Vận chuyển
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Đổi trả
              </a>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Cham Pets. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
