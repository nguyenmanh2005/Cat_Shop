import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">
          🐱 CatShop
        </Link>
        <Link to="/" className="hover:text-gray-200">
          Trang chủ
        </Link>
        <Link to="/products" className="hover:text-gray-200">
          Sản phẩm
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {token ? (
          <>
            {role === "admin" && (
              <Link to="/admin" className="hover:text-gray-200">
                Quản trị
              </Link>
            )}
            <Link to="/profile" className="hover:text-gray-200">
              Hồ sơ
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:text-gray-200">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
