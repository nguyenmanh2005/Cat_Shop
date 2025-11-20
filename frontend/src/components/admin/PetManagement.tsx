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
import { useToast } from "@/hooks/use-toast";
import { petService, type PetRecord } from "@/services/petService";
import { formatCurrencyVND, formatDateTime } from "@/lib/utils";

type PetStatus = "available" | "sold" | "reserved";

interface AdminPet {
  id: number;
  name: string;
  imageUrl?: string;
  price: number;
  age?: number;
  breed?: string;
  gender?: string;
  status: PetStatus;
  vaccinated?: boolean;
  description?: string;
  createdAt?: string;
}

const PetManagement = () => {
  const [pets, setPets] = useState<AdminPet[]>([]);
  const [filteredPets, setFilteredPets] = useState<AdminPet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [breedFilter, setBreedFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const normalizePet = (pet: PetRecord): AdminPet => {
    const stockQuantity = Number(pet.stockQuantity ?? 0);
    const status: PetStatus = stockQuantity <= 0 ? "sold" : "available";

    return {
      id: pet.productId ?? 0,
      name: pet.productName ?? "Chưa đặt tên",
      imageUrl: pet.imageUrl,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      vaccinated: pet.vaccinated,
      price: Number(pet.price ?? 0),
      status,
      description: pet.description,
      createdAt: undefined,
    };
  };

  useEffect(() => {
    let ignore = false;
    const loadPets = async () => {
      try {
        setIsLoading(true);
        const data = await petService.getAllPets();
        if (ignore) return;
        const normalized = (data || []).map(normalizePet);
        setPets(normalized);
        setFilteredPets(normalized);
      } catch (error: any) {
        if (ignore) return;
        console.error("Error loading pets:", error);
        toast({
          title: "Không thể tải danh sách mèo",
          description: error?.message || "Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadPets();
    return () => {
      ignore = true;
    };
  }, [toast]);

  useEffect(() => {
    let filtered = pets;

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (pet) =>
          pet.name.toLowerCase().includes(keyword) ||
          pet.breed?.toLowerCase().includes(keyword) ||
          pet.description?.toLowerCase().includes(keyword)
      );
    }

    if (breedFilter !== "all") {
      filtered = filtered.filter((pet) => pet.breed === breedFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((pet) => pet.status === statusFilter);
    }

    setFilteredPets(filtered);
  }, [pets, searchTerm, breedFilter, statusFilter]);

  const handleDeletePet = async (petId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mèo này?")) return;
    try {
      await petService.deletePet(petId);
      setPets((prev) => prev.filter((pet) => pet.id !== petId));
      setFilteredPets((prev) => prev.filter((pet) => pet.id !== petId));
      toast({
        title: "Đã xóa mèo",
        description: `Mèo #${petId} đã được xóa.`,
      });
    } catch (error: any) {
      console.error("Delete pet error:", error);
      toast({
        title: "Xóa mèo thất bại",
        description: error?.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleExportPets = () => {
    const csvContent = [
      ["ID", "Tên", "Giống", "Tuổi", "Giá", "Trạng thái", "Mô tả", "Ngày tạo"],
      ...filteredPets.map((pet) => [
        pet.id,
        pet.name,
        pet.breed || "",
        pet.age ?? "",
        pet.price,
        pet.status,
        pet.description || "",
        pet.createdAt ? formatDateTime(pet.createdAt) : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pets_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: PetStatus) => {
    const variants = {
      available: "default",
      sold: "destructive",
      reserved: "secondary",
    } as const;

    const labels = {
      available: "Có sẵn",
      sold: "Đã bán",
      reserved: "Đã đặt",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getUniqueBreeds = () => {
    const breeds = pets
      .map((pet) => pet.breed)
      .filter(Boolean) as string[];
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
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {pet.imageUrl ? (
                            <img
                              src={pet.imageUrl}
                              alt={pet.name}
                              className="w-12 h-12 object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{pet.id}</TableCell>
                      <TableCell className="font-medium">{pet.name}</TableCell>
                      <TableCell>{pet.breed || "—"}</TableCell>
                      <TableCell>{pet.age ? `${pet.age} tháng` : "—"}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrencyVND(pet.price)}
                      </TableCell>
                      <TableCell>{getStatusBadge(pet.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pet.createdAt ? formatDateTime(pet.createdAt) : "—"}
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
