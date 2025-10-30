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
import { Trash2, Edit, Plus, Search, Filter } from 'lucide-react';
import { foodDetailService } from '@/services';
import { FoodDetail, ProductSearchParams } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const FoodDetailManagement: React.FC = () => {
  const [foodDetails, setFoodDetails] = useState<FoodDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFoodDetail, setEditingFoodDetail] = useState<FoodDetail | null>(null);
  const [formData, setFormData] = useState({
    foodId: '',
    weightKg: '',
    ingredients: '',
    expiryDate: ''
  });
  const { toast } = useToast();

  // Load food details
  const loadFoodDetails = async () => {
    setLoading(true);
    try {
      const response = await foodDetailService.getAdminList({
        page: 0,
        size: 50
      });
      setFoodDetails(response.content || []);
    } catch (error) {
      console.error('Error loading food details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách chi tiết thức ăn',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Search by ingredients
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadFoodDetails();
      return;
    }

    setLoading(true);
    try {
      const results = await foodDetailService.searchByIngredients(searchTerm);
      setFoodDetails(results);
    } catch (error) {
      console.error('Error searching food details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tìm kiếm chi tiết thức ăn',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter by expiry date
  const handleFilterByExpiry = async () => {
    if (!expiryFilter) {
      loadFoodDetails();
      return;
    }

    setLoading(true);
    try {
      const results = await foodDetailService.filterByExpiry(expiryFilter);
      setFoodDetails(results);
    } catch (error) {
      console.error('Error filtering food details:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lọc chi tiết thức ăn',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update food detail
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.foodId || !formData.weightKg || !formData.ingredients || !formData.expiryDate) {
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
        foodId: parseInt(formData.foodId),
        weightKg: parseFloat(formData.weightKg),
        ingredients: formData.ingredients,
        expiryDate: formData.expiryDate
      };

      if (editingFoodDetail) {
        await foodDetailService.update(editingFoodDetail.foodId, data);
        toast({
          title: 'Thành công',
          description: 'Cập nhật chi tiết thức ăn thành công'
        });
      } else {
        await foodDetailService.create(data);
        toast({
          title: 'Thành công',
          description: 'Tạo chi tiết thức ăn thành công'
        });
      }

      setIsDialogOpen(false);
      setEditingFoodDetail(null);
      setFormData({ foodId: '', weightKg: '', ingredients: '', expiryDate: '' });
      loadFoodDetails();
    } catch (error) {
      console.error('Error saving food detail:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu chi tiết thức ăn',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete food detail
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi tiết thức ăn này?')) {
      return;
    }

    setLoading(true);
    try {
      await foodDetailService.delete(id);
      toast({
        title: 'Thành công',
        description: 'Xóa chi tiết thức ăn thành công'
      });
      loadFoodDetails();
    } catch (error) {
      console.error('Error deleting food detail:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa chi tiết thức ăn',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit food detail
  const handleEdit = (foodDetail: FoodDetail) => {
    setEditingFoodDetail(foodDetail);
    setFormData({
      foodId: foodDetail.foodId.toString(),
      weightKg: foodDetail.weightKg?.toString() || '',
      ingredients: foodDetail.ingredients || '',
      expiryDate: foodDetail.expiryDate || ''
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const handleReset = () => {
    setEditingFoodDetail(null);
    setFormData({ foodId: '', weightKg: '', ingredients: '', expiryDate: '' });
    setIsDialogOpen(false);
  };

  useEffect(() => {
    loadFoodDetails();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Chi tiết Thức ăn</h2>
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
                {editingFoodDetail ? 'Cập nhật Chi tiết Thức ăn' : 'Thêm Chi tiết Thức ăn'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="foodId">ID Sản phẩm</Label>
                <Input
                  id="foodId"
                  type="number"
                  value={formData.foodId}
                  onChange={(e) => setFormData({ ...formData, foodId: e.target.value })}
                  placeholder="Nhập ID sản phẩm"
                  required
                />
              </div>
              <div>
                <Label htmlFor="weightKg">Trọng lượng (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.01"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  placeholder="Nhập trọng lượng"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ingredients">Thành phần</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="Nhập thành phần"
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Hạn sử dụng</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Đang lưu...' : editingFoodDetail ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Tìm theo thành phần</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập thành phần để tìm kiếm"
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="expiry">Lọc theo hạn sử dụng</Label>
              <div className="flex space-x-2">
                <Input
                  id="expiry"
                  type="date"
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                />
                <Button onClick={handleFilterByExpiry} disabled={loading}>
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách Chi tiết Thức ăn</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : foodDetails.length === 0 ? (
            <Alert>
              <AlertDescription>Không có chi tiết thức ăn nào</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Sản phẩm</TableHead>
                  <TableHead>Trọng lượng (kg)</TableHead>
                  <TableHead>Thành phần</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodDetails.map((foodDetail) => (
                  <TableRow key={foodDetail.foodId}>
                    <TableCell>{foodDetail.foodId}</TableCell>
                    <TableCell>{foodDetail.weightKg}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={foodDetail.ingredients}>
                        {foodDetail.ingredients}
                      </div>
                    </TableCell>
                    <TableCell>
                      {foodDetail.expiryDate && (
                        <Badge variant={new Date(foodDetail.expiryDate) > new Date() ? 'default' : 'destructive'}>
                          {new Date(foodDetail.expiryDate).toLocaleDateString('vi-VN')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(foodDetail)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(foodDetail.foodId)}
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
