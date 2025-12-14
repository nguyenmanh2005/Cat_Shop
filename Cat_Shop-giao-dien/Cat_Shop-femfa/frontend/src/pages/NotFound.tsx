import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background page-transition overflow-x-hidden">
      <div className="text-center animate-fade-in-up space-y-6">
        <div className="animate-bounce">
          <h1 className="mb-4 text-8xl font-bold text-primary animate-pulse">404</h1>
        </div>
        <p className="mb-4 text-2xl text-foreground font-semibold">Oops! Trang không tìm thấy</p>
        <p className="text-muted-foreground mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline transition-colors hover-lift px-6 py-3 rounded-lg"
        >
          Quay về trang chủ
        </a>
      </div>
    </div>
  );
};

export default NotFound;
