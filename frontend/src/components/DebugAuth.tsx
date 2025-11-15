import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/services/authService';
import { API_CONFIG } from '@/config/api';

export const DebugAuth: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: any) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testRegister = async () => {
    setIsLoading(true);
    addResult({
      name: 'Test Register API',
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    });

    try {
      // Test data
      const testData = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'test123456',
        phone: '0123456789',
        address: 'Test Address'
      };

      console.log('Testing register with data:', testData);
      console.log('API URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.REGISTER);

      const response = await authService.register(testData);
      
      addResult({
        name: 'Register Success',
        status: 'success',
        message: 'Đăng ký thành công',
        data: response,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error: any) {
      console.error('Register error:', error);
      
      addResult({
        name: 'Register Error',
        status: 'error',
        message: error.message || 'Lỗi không xác định',
        error: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        },
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setIsLoading(false);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addResult({
      name: 'Test Connection',
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    });

    try {
      const response = await fetch(API_CONFIG.BASE_URL + '/products');
      console.log('Connection test response:', response);
      
      addResult({
        name: 'Connection Test',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Kết nối thành công' : `Lỗi: ${response.status} ${response.statusText}`,
        data: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        },
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (error: any) {
      console.error('Connection error:', error);
      
      addResult({
        name: 'Connection Error',
        status: 'error',
        message: error.message || 'Không thể kết nối',
        error: error,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Đang test</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Thành công</Badge>;
      case 'error':
        return <Badge variant="destructive">Lỗi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Authentication</CardTitle>
        <p className="text-sm text-muted-foreground">
          Debug component để kiểm tra vấn đề đăng ký
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            variant="outline"
          >
            Test Kết Nối
          </Button>
          <Button 
            onClick={testRegister} 
            disabled={isLoading}
          >
            Test Đăng Ký
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
          <h3 className="font-semibold">Kết quả debug:</h3>
          {results.length === 0 ? (
            <Alert>
              <AlertDescription>
                Chưa có kết quả debug nào. Nhấn "Test Kết Nối" hoặc "Test Đăng Ký" để bắt đầu.
              </AlertDescription>
            </Alert>
          ) : (
            results.map((result, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{result.name}</div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                    <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                  </div>
                </div>
                
                {result.message && (
                  <div className="text-sm text-muted-foreground">
                    {result.message}
                  </div>
                )}

                {result.error && (
                  <div className="text-xs bg-red-50 p-2 rounded border">
                    <div className="font-medium text-red-800">Error Details:</div>
                    <pre className="text-xs text-red-700 mt-1 overflow-auto">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                )}

                {result.data && (
                  <div className="text-xs bg-blue-50 p-2 rounded border">
                    <div className="font-medium text-blue-800">Response Data:</div>
                    <pre className="text-xs text-blue-700 mt-1 overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <Alert>
          <AlertDescription>
            <strong>API Configuration:</strong><br/>
            Base URL: <code className="px-1 py-0.5 bg-muted rounded text-xs">{API_CONFIG.BASE_URL}</code><br/>
            Register Endpoint: <code className="px-1 py-0.5 bg-muted rounded text-xs">{API_CONFIG.ENDPOINTS.AUTH.REGISTER}</code><br/>
            Full URL: <code className="px-1 py-0.5 bg-muted rounded text-xs">{API_CONFIG.BASE_URL}{API_CONFIG.ENDPOINTS.AUTH.REGISTER}</code>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
