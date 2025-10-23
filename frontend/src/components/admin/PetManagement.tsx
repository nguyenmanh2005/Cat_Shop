import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  PawPrint,
  Download,
  MoreHorizontal,
  Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Pet {
  id: string;
  name: string;
  image: string;
  price: string;
  age: string;
  breed: string;
  status: 'available' | 'sold' | 'reserved';
  description?: string;
  createdAt: string;
}

const PetManagement = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load pets từ localStorage hoặc mock data
  useEffect(() => {
    const loadPets = () => {
      try {
        // Kiểm tra localStorage trước
        const petsData = localStorage.getItem("cham_pets_pets");
        if (petsData) {
          const allPets = JSON.parse(petsData);
          setPets(allPets);
          setFilteredPets(allPets);
        } else {
          // Nếu chưa có data, tạo mock data
          const mockPets: Pet[] = [
            {
              id: "1",
              name: "A'khan",
              image: "/src/assets/pet1.jpg",
              price: "15.000.000 VNĐ",
              age: "3 tháng",
              breed: "Bengal",
              status: "available",
              description: "Mèo Bengal đẹp, khỏe mạnh",
              createdAt: new Date().toISOString()
            },
            {
              id: "2", 
              name: "Mochi",
              image: "/src/assets/pet2.jpg",
              price: "8.000.000 VNĐ",
              age: "2 tháng",
              breed: "Ragdoll",
              status: "available",
              description: "Mèo Ragdoll hiền lành",
              createdAt: new Date().toISOString()
            },
            {
              id: "3",
              name: "Aabaa", 
              image: "/src/assets/pet3.jpg",
              price: "6.000.000 VNĐ",
              age: "2.5 tháng",
              breed: "Mèo ta",
              status: "sold",
              description: "Mèo ta Việt Nam",
              createdAt: new Date().toISOString()
            },
            {
              id: "4",
              name: "Aabaan",
              image: "/src/assets/pet4.jpg",
              price: "7.500.000 VNĐ", 
              age: "3 tháng",
              breed: "British Shorthair",
              status: "reserved",
              description: "Mèo British Shorthair xám",
              createdAt: new Date().toISOString()
            },
            {
              id: "5",
              name: "Luna",
              image: "/src/assets/pet1.jpg",
              price: "12.000.000 VNĐ",
              age: "4 tháng", 
              breed: "Maine Coon",
              status: "available",
              description: "Mèo Maine Coon lớn",
              createdAt: new Date().toISOString()
            },
            {
              id: "6",
              name: "Mimi",
              image: "/src/assets/pet2.jpg",
              price: "5.500.000 VNĐ",
              age: "2 tháng",
              breed: "Persian",
              status: "available",
              description: "Mèo Persian lông dài",
              createdAt: new Date().toISOString()
            }
          ];
          setPets(mockPets);
          setFilteredPets(mockPets);
          localStorage.setItem("cham_pets_pets", JSON.stringify(mockPets));
        }
      } catch (error) {
        console.error("Error loading pets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, []);

  // Filter pets
  useEffect(() => {
    let filtered = pets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Breed filter
    if (breedFilter !== "all") {
      filtered = filtered.filter(pet => pet.breed === breedFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(pet => pet.status === statusFilter);
    }

    setFilteredPets(filtered);
  }, [pets, searchTerm, breedFilter, statusFilter]);

  const handleDeletePet = (petId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mèo này?")) {
      const updatedPets = pets.filter(pet => pet.id !== petId);
      setPets(updatedPets);
      localStorage.setItem("cham_pets_pets", JSON.stringify(updatedPets));
    }
  };

  const handleChangeStatus = (petId: string, newStatus: 'available' | 'sold' | 'reserved') => {
    const updatedPets = pets.map(pet => 
      pet.id === petId ? { ...pet, status: newStatus } : pet
    );
    setPets(updatedPets);
    localStorage.setItem("cham_pets_pets", JSON.stringify(updatedPets));
  };

  const handleExportPets = () => {
    const csvContent = [
      ['ID', 'Tên', 'Giống', 'Tuổi', 'Giá', 'Trạng thái', 'Mô tả', 'Ngày tạo'],
      ...filteredPets.map(pet => [
        pet.id,
        pet.name,
        pet.breed,
        pet.age,
        pet.price,
        pet.status === 'available' ? 'Có sẵn' : pet.status === 'sold' ? 'Đã bán' : 'Đã đặt',
        pet.description || '',
        new Date(pet.createdAt).toLocaleDateString('vi-VN')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pets_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'default',
      sold: 'destructive',
      reserved: 'secondary'
    } as const;
    
    const labels = {
      available: 'Có sẵn',
      sold: 'Đã bán',
      reserved: 'Đã đặt'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getUniqueBreeds = () => {
    const breeds = pets.map(pet => pet.breed);
    return [...new Set(breeds)];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Mèo</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả mèo cảnh trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPets}>
            <Download className="h-4 w-4 mr-2" />
            Xuất CSV
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Thêm Mèo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng Mèo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Có sẵn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pets.filter(p => p.status === 'available').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đã bán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pets.filter(p => p.status === 'sold').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Đã đặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pets.filter(p => p.status === 'reserved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, giống, mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={breedFilter} onValueChange={setBreedFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo giống" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả giống</SelectItem>
                {getUniqueBreeds().map(breed => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="available">Có sẵn</SelectItem>
                <SelectItem value="sold">Đã bán</SelectItem>
                <SelectItem value="reserved">Đã đặt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Mèo ({filteredPets.length})</CardTitle>
          <CardDescription>
            Hiển thị {filteredPets.length} trong tổng số {pets.length} mèo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Giống</TableHead>
                  <TableHead>Tuổi</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy mèo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{pet.id}</TableCell>
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{pet.age}</TableCell>
                      <TableCell className="font-medium text-green-600">{pet.price}</TableCell>
                      <TableCell>{getStatusBadge(pet.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(pet.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(pet.id, 'available')}
                            >
                              Đánh dấu Có sẵn
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(pet.id, 'sold')}
                            >
                              Đánh dấu Đã bán
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(pet.id, 'reserved')}
                            >
                              Đánh dấu Đã đặt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeletePet(pet.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetManagement;
