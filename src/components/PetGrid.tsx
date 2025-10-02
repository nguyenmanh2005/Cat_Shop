import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PetCard from "./PetCard";
import Breadcrumb from "./Breadcrumb";
import pet1 from "@/assets/pet1.jpg";
import pet2 from "@/assets/pet2.jpg";
import pet3 from "@/assets/pet3.jpg";
import pet4 from "@/assets/pet4.jpg";

interface Pet {
  id: string;
  name: string;
  image: string;
  price: string;
  age: string;
  breed: string;
}

const mockPets: Pet[] = [
  {
    id: "1",
    name: "A'khan",
    image: pet1,
    price: "15.000.000 VNĐ",
    age: "3 tháng",
    breed: "Bengal"
  },
  {
    id: "2", 
    name: "Mochi",
    image: pet2,
    price: "8.000.000 VNĐ",
    age: "2 tháng",
    breed: "Ragdoll"
  },
  {
    id: "3",
    name: "Aabaa", 
    image: pet3,
    price: "6.000.000 VNĐ",
    age: "2.5 tháng",
    breed: "Mèo ta"
  },
  {
    id: "4",
    name: "Aabaan",
    image: pet4,
    price: "7.500.000 VNĐ", 
    age: "3 tháng",
    breed: "British Shorthair"
  },
  {
    id: "5",
    name: "Luna",
    image: pet1,
    price: "12.000.000 VNĐ",
    age: "4 tháng", 
    breed: "Maine Coon"
  },
  {
    id: "6",
    name: "Mimi",
    image: pet2,
    price: "5.500.000 VNĐ",
    age: "2 tháng",
    breed: "Persian"
  },
  {
    id: "7",
    name: "Shadow",
    image: pet3,
    price: "9.000.000 VNĐ",
    age: "3.5 tháng",
    breed: "Scottish Fold"
  },
  {
    id: "8",
    name: "Whiskers",
    image: pet4,
    price: "11.000.000 VNĐ",
    age: "4 tháng",
    breed: "Sphynx"
  }
];

const PetGrid = () => {
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [sortBy, setSortBy] = useState("default");

  const breadcrumbItems = [
    { label: "TRANG CHỦ", href: "/" },
    { label: "MÈO CẢNH" }
  ];

  useEffect(() => {
    let sortedPets = [...mockPets];
    
    switch (sortBy) {
      case "price-low-high":
        sortedPets.sort((a, b) => parseFloat(a.price.replace(/[^\d]/g, '')) - parseFloat(b.price.replace(/[^\d]/g, '')));
        break;
      case "price-high-low":
        sortedPets.sort((a, b) => parseFloat(b.price.replace(/[^\d]/g, '')) - parseFloat(a.price.replace(/[^\d]/g, '')));
        break;
      case "name-a-z":
        sortedPets.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        sortedPets.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    
    setPets(sortedPets);
  }, [sortBy]);

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">MÈO CẢNH</h1>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp mặc định" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Sắp xếp mặc định</SelectItem>
              <SelectItem value="price-low-high">Giá: Thấp đến cao</SelectItem>
              <SelectItem value="price-high-low">Giá: Cao đến thấp</SelectItem>
              <SelectItem value="name-a-z">Tên: A đến Z</SelectItem>
              <SelectItem value="name-z-a">Tên: Z đến A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              id={pet.id}
              name={pet.name}
              image={pet.image}
              price={pet.price}
              age={pet.age}
              breed={pet.breed}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetGrid;