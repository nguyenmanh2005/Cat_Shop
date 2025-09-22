interface PetCardProps {
  id: string;
  name: string;
  image: string;
  price?: string;
  age?: string;
  breed?: string;
}

const PetCard = ({ name, image, price, age, breed }: PetCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-2">{name}</h3>
        {breed && (
          <p className="text-sm text-muted-foreground mb-1">Giống: {breed}</p>
        )}
        {age && (
          <p className="text-sm text-muted-foreground mb-1">Tuổi: {age}</p>
        )}
        {price && (
          <p className="text-lg font-bold text-primary mt-2">{price}</p>
        )}
      </div>
    </div>
  );
};

export default PetCard;