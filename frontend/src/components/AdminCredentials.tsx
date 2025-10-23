import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff, Shield, Mail, Phone, MapPin, User } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const AdminCredentials: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const adminInfo = {
    username: 'admin',
    email: 'admin@catshop.com',
    password: 'admin123',
    phone: '0123456789',
    address: '123 Admin Street, Ho Chi Minh City',
    role: 'Admin'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  const copyAllCredentials = () => {
    const credentials = `Username: ${adminInfo.username}
Email: ${adminInfo.email}
Password: ${adminInfo.password}
Phone: ${adminInfo.phone}
Address: ${adminInfo.address}
Role: ${adminInfo.role}`;
    
    navigator.clipboard.writeText(credentials);
    toast({
      title: "Đã sao chép tất cả",
      description: "Thông tin đăng nhập đã được sao chép vào clipboard",
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <CardTitle className="text-2xl font-bold text-blue-600">
            Tài Khoản Admin Mặc Định
          </CardTitle>
        </div>
        <p className="text-muted-foreground">
          Sử dụng thông tin này để đăng nhập vào Admin Panel
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Username */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Username</p>
              <p className="text-sm text-muted-foreground">Tên đăng nhập</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {adminInfo.username}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(adminInfo.username, 'Username')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">Địa chỉ email</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {adminInfo.email}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(adminInfo.email, 'Email')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Mật khẩu</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {showPassword ? adminInfo.password : '••••••••'}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(adminInfo.password, 'Password')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
              {adminInfo.phone}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(adminInfo.phone, 'Phone')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-sm text-muted-foreground">Địa chỉ</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <code className="px-2 py-1 bg-muted rounded text-sm font-mono max-w-xs truncate">
              {adminInfo.address}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(adminInfo.address, 'Address')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground">Vai trò</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive" className="px-3 py-1">
              {adminInfo.role}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button 
            onClick={copyAllCredentials}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Sao Chép Tất Cả
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/admin'}
            className="flex-1"
          >
            <Shield className="h-4 w-4 mr-2" />
            Truy Cập Admin Panel
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Đảm bảo backend Spring Boot đang chạy trên port 8080</li>
            <li>Đảm bảo database đã được khởi tạo với: <code className="bg-blue-100 px-1 rounded">npm run init-db</code></li>
            <li>Khởi động frontend với: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
            <li>Sử dụng thông tin trên để đăng nhập</li>
            <li>Truy cập Admin Panel tại <code className="bg-blue-100 px-1 rounded">/admin</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
