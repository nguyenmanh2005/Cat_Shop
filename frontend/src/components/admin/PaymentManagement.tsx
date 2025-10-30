import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Edit, Plus, Search, Filter, CreditCard, DollarSign } from 'lucide-react';
import { paymentService } from '@/services';
import { Payment } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [methodFilter, setMethodFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    orderId: '',
    method: 'CASH',
    amount: '',
    status: 'pending'
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    methodSummary: [] as [string, number, number][]
  });
  const { toast } = useToast();

  // Load payments
  const loadPayments = async () => {
    setLoading(true);
    try {
      const results = await paymentService.getAll();
      setPayments(results);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách thanh toán',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const [totalRevenue, methodSummary] = await Promise.all([
        paymentService.getTotalRevenue(),
        paymentService.getMethodSummary()
      ]);
      setStats({ totalRevenue, methodSummary });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Filter by method
  const handleFilterByMethod = async () => {
    if (!methodFilter) {
      loadPayments();
      return;
    }

    setLoading(true);
    try {
      const results = await paymentService.getByMethod(methodFilter);
      setPayments(results);
    } catch (error) {
      console.error('Error filtering payments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lọc thanh toán',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter by min amount
  const handleFilterByMinAmount = async () => {
    if (!minAmount) {
      loadPayments();
      return;
    }

    setLoading(true);
    try {
      const results = await paymentService.getByMinAmount(parseFloat(minAmount));
      setPayments(results);
    } catch (error) {
      console.error('Error filtering payments by amount:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lọc thanh toán theo số tiền',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter by date range
  const handleFilterByDateRange = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn khoảng thời gian',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const results = await paymentService.getByDateRange(startDate, endDate);
      setPayments(results);
    } catch (error) {
      console.error('Error filtering payments by date:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lọc thanh toán theo ngày',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderId || !formData.method || !formData.amount) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        orderId: parseInt(formData.orderId),
        method: formData.method,
        amount: parseFloat(formData.amount),
        status: formData.status
      };

      if (editingPayment) {
        await paymentService.update(editingPayment.paymentId, data);
        toast({
          title: 'Thành công',
          description: 'Cập nhật thanh toán thành công'
        });
      } else {
        await paymentService.create(data);
        toast({
          title: 'Thành công',
          description: 'Tạo thanh toán thành công'
        });
      }

      setIsDialogOpen(false);
      setEditingPayment(null);
      setFormData({ orderId: '', method: 'CASH', amount: '', status: 'pending' });
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thanh toán',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thanh toán này?')) {
      return;
    }

    setLoading(true);
    try {
      await paymentService.delete(id);
      toast({
        title: 'Thành công',
        description: 'Xóa thanh toán thành công'
      });
      loadPayments();
      loadStats();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa thanh toán',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit payment
  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      orderId: payment.orderId.toString(),
      method: payment.method,
      amount: payment.amount.toString(),
      status: payment.status || 'pending'
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const handleReset = () => {
    setEditingPayment(null);
    setFormData({ orderId: '', method: 'CASH', amount: '', status: 'pending' });
    setIsDialogOpen(false);
  };

  // Get method badge variant
  const getMethodBadgeVariant = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'default';
      case 'credit_card':
        return 'secondary';
      case 'momo':
        return 'outline';
      case 'bank_transfer':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Thanh toán</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleReset}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? 'Cập nhật Thanh toán' : 'Thêm Thanh toán'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="orderId">ID Đơn hàng</Label>
                <Input
                  id="orderId"
                  type="number"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="Nhập ID đơn hàng"
                  required
                />
              </div>
              <div>
                <Label htmlFor="method">Phương thức thanh toán</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
                    <SelectItem value="MOMO">Momo</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Số tiền</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Nhập số tiền"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang lưu...' : editingPayment ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Tổng doanh thu</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Phương thức thanh toán</p>
                <p className="text-2xl font-bold">{stats.methodSummary.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Method Summary */}
      {stats.methodSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thống kê theo Phương thức</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.methodSummary.map(([method, count, sum]) => (
                <div key={method} className="text-center p-4 border rounded-lg">
                  <p className="font-medium capitalize">{method}</p>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600">{formatCurrency(sum)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="methodFilter">Lọc theo phương thức</Label>
              <div className="flex space-x-2">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="CASH">Tiền mặt</SelectItem>
                    <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
                    <SelectItem value="MOMO">Momo</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleFilterByMethod} disabled={loading}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="minAmount">Số tiền tối thiểu</Label>
              <div className="flex space-x-2">
                <Input
                  id="minAmount"
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                />
                <Button onClick={handleFilterByMinAmount} disabled={loading}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <div className="flex space-x-2">
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Button onClick={handleFilterByDateRange} disabled={loading}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách Thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : payments.length === 0 ? (
            <Alert>
              <AlertDescription>Không có thanh toán nào</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>ID Đơn hàng</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell>{payment.paymentId}</TableCell>
                    <TableCell>{payment.orderId}</TableCell>
                    <TableCell>
                      <Badge variant={getMethodBadgeVariant(payment.method)}>
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.createdAt && new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(payment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(payment.paymentId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
