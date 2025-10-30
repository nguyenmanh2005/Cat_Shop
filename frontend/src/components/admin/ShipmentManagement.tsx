import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Edit, Plus, Search, Filter, Package, Truck } from 'lucide-react';
import { shipmentService } from '@/services';
import { Shipment } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const ShipmentManagement: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [formData, setFormData] = useState({
    orderId: '',
    shippingAddress: '',
    status: 'pending'
  });
  const [stats, setStats] = useState<[string, number][]>([]);
  const { toast } = useToast();

  // Load shipments
  const loadShipments = async () => {
    setLoading(true);
    try {
      const results = await shipmentService.getAll();
      setShipments(results);
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách vận chuyển',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const results = await shipmentService.getCountByStatus();
      setStats(results);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Search by address
  const handleSearchByAddress = async () => {
    if (!searchAddress.trim()) {
      loadShipments();
      return;
    }

    setLoading(true);
    try {
      const results = await shipmentService.getByAddress(searchAddress);
      setShipments(results);
    } catch (error) {
      console.error('Error searching shipments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tìm kiếm vận chuyển',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter by status
  const handleFilterByStatus = async () => {
    if (!statusFilter) {
      loadShipments();
      return;
    }

    setLoading(true);
    try {
      const results = await shipmentService.getByStatus(statusFilter);
      setShipments(results);
    } catch (error) {
      console.error('Error filtering shipments:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lọc vận chuyển',
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
      const results = await shipmentService.getByDateRange(startDate, endDate);
      setShipments(results);
    } catch (error) {
      console.error('Error filtering shipments by date:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lọc vận chuyển theo ngày',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update shipment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderId || !formData.shippingAddress || !formData.status) {
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
        shippingAddress: formData.shippingAddress,
        status: formData.status
      };

      if (editingShipment) {
        await shipmentService.update(editingShipment.shipmentId, data);
        toast({
          title: 'Thành công',
          description: 'Cập nhật vận chuyển thành công'
        });
      } else {
        await shipmentService.create(data);
        toast({
          title: 'Thành công',
          description: 'Tạo vận chuyển thành công'
        });
      }

      setIsDialogOpen(false);
      setEditingShipment(null);
      setFormData({ orderId: '', shippingAddress: '', status: 'pending' });
      loadShipments();
      loadStats();
    } catch (error) {
      console.error('Error saving shipment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu vận chuyển',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete shipment
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vận chuyển này?')) {
      return;
    }

    setLoading(true);
    try {
      await shipmentService.delete(id);
      toast({
        title: 'Thành công',
        description: 'Xóa vận chuyển thành công'
      });
      loadShipments();
      loadStats();
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa vận chuyển',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit shipment
  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setFormData({
      orderId: shipment.orderId.toString(),
      shippingAddress: shipment.shippingAddress,
      status: shipment.status
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const handleReset = () => {
    setEditingShipment(null);
    setFormData({ orderId: '', shippingAddress: '', status: 'pending' });
    setIsDialogOpen(false);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    loadShipments();
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Vận chuyển</h2>
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
                {editingShipment ? 'Cập nhật Vận chuyển' : 'Thêm Vận chuyển'}
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
                <Label htmlFor="shippingAddress">Địa chỉ giao hàng</Label>
                <Textarea
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  placeholder="Nhập địa chỉ giao hàng"
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
                    <SelectItem value="shipped">Đã gửi</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang lưu...' : editingShipment ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map(([status, count]) => (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="searchAddress">Tìm theo địa chỉ</Label>
              <div className="flex space-x-2">
                <Input
                  id="searchAddress"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                />
                <Button onClick={handleSearchByAddress} disabled={loading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="statusFilter">Lọc theo trạng thái</Label>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="shipped">Đã gửi</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleFilterByStatus} disabled={loading}>
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

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách Vận chuyển</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : shipments.length === 0 ? (
            <Alert>
              <AlertDescription>Không có vận chuyển nào</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>ID Đơn hàng</TableHead>
                  <TableHead>Địa chỉ giao hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.shipmentId}>
                    <TableCell>{shipment.shipmentId}</TableCell>
                    <TableCell>{shipment.orderId}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={shipment.shippingAddress}>
                        {shipment.shippingAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shipment.createdAt && new Date(shipment.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(shipment)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(shipment.shipmentId)}
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
