import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { productService, categoryService } from '@/services/productService';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export const ApiTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const updateResult = (index: number, updates: Partial<TestResult>) => {
    setResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...updates } : result
    ));
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setResults([]);

    const tests = [
      {
        name: 'Test kết nối cơ bản',
        test: async () => {
          // Test basic connectivity với Spring Boot
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/products`);
          return response.ok ? 'Kết nối thành công với Spring Boot' : `Kết nối thất bại: ${response.status}`;
        }
      },
      {
        name: 'Test lấy danh sách sản phẩm',
        test: async () => {
          const products = await productService.getAllProducts();
          return `Lấy được ${products.length} sản phẩm`;
        }
      },
      {
        name: 'Test lấy danh mục',
        test: async () => {
          const categories = await categoryService.getAllCategories();
          return `Lấy được ${categories.length} danh mục`;
        }
      },
      {
        name: 'Test lấy người dùng',
        test: async () => {
          const users = await userService.getAllUsers();
          return `Lấy được ${users.length} người dùng`;
        }
      }
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      addResult({
        name: test.name,
        status: 'pending'
      });

      try {
        const message = await test.test();
        updateResult(i, {
          status: 'success',
          message
        });
      } catch (error) {
        updateResult(i, {
          status: 'error',
          message: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
      }
    }

    setIsLoading(false);
  };

  const testLogin = async () => {
    setIsLoading(true);
    addResult({
      name: 'Test đăng nhập',
      status: 'pending'
    });

    try {
      // Thử đăng nhập với tài khoản admin mặc định
      const result = await authService.login({
        email: 'admin@catshop.com',
        password: 'admin123'
      });
      
      updateResult(results.length, {
        status: 'success',
        message: result.success ? 'Login successful (trusted device)' : (result.requiresOtp ? (result.message || 'New device. OTP has been sent to email.') : 'Login failed')
      });
    } catch (error) {
      updateResult(results.length, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Login error'
      });
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Đang test</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-blue-500">Thành công</Badge>;
      case 'error':
        return <Badge variant="destructive">Lỗi</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Test Kết Nối API Backend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Component để test kết nối với backend API của bạn T
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={runAllTests} 
            disabled={isLoading}
            className="flex-1 min-w-[200px]"
          >
            {isLoading ? 'Đang test...' : 'Test Tất Cả'}
          </Button>
          <Button 
            onClick={testLogin} 
            disabled={isLoading}
            variant="outline"
          >
            Test Đăng Nhập
          </Button>
          <Button 
            onClick={clearResults} 
            disabled={isLoading}
            variant="outline"
          >
            Xóa Kết Quả
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Kết quả test:</h3>
          {results.length === 0 ? (
            <Alert>
              <AlertDescription>
                Chưa có kết quả test nào. Nhấn "Test Tất Cả" để bắt đầu.
              </AlertDescription>
            </Alert>
          ) : (
            results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
                  {result.message && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))
          )}
        </div>

        <Alert>
          <AlertDescription>
            <strong>Lưu ý:</strong> Đảm bảo backend Spring Boot của bạn T đang chạy trên port 8080 và có thể truy cập được từ URL: 
            <code className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
            </code>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
