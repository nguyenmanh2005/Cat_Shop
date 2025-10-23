import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminCredentials } from '@/components/AdminCredentials';
import { Shield, Eye, EyeOff } from 'lucide-react';

const LoginTest = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'admin@catshop.com',
    password: 'admin123'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/admin');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@catshop.com',
      password: 'admin123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">
                Đăng Nhập Admin
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              Sử dụng tài khoản admin để truy cập Admin Panel
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@catshop.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="admin123"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillAdminCredentials}
                  className="flex-1"
                >
                  Điền Thông Tin Admin
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Thông tin đăng nhập mặc định:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Email:</strong> admin@catshop.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Credentials */}
        <div className="hidden lg:block">
          <AdminCredentials />
        </div>
      </div>
    </div>
  );
};

export default LoginTest;
