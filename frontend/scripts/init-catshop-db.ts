import pool from "../src/database/schema";

// Script tạo bảng từ file Database_CatShop.txt
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS Roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255),
  role_id INT NOT NULL REFERENCES Roles(role_id)
);

-- Loại sản phẩm lớn
CREATE TABLE IF NOT EXISTS ProductTypes (
  type_id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

-- Danh mục con
CREATE TABLE IF NOT EXISTS Categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  type_id INT NOT NULL REFERENCES ProductTypes(type_id)
);

-- Sản phẩm chung
CREATE TABLE IF NOT EXISTS Products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  type_id INT NOT NULL REFERENCES ProductTypes(type_id),
  category_id INT REFERENCES Categories(category_id),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  description TEXT,
  image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS CatDetails (
  cat_id INT PRIMARY KEY REFERENCES Products(product_id) ON DELETE CASCADE,
  breed VARCHAR(100),
  age INT,
  gender VARCHAR(10),
  vaccinated BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS FoodDetails (
  food_id INT PRIMARY KEY REFERENCES Products(product_id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2),
  ingredients TEXT,
  expiry_date DATE
);

CREATE TABLE IF NOT EXISTS CageDetails (
  cage_id INT PRIMARY KEY REFERENCES Products(product_id) ON DELETE CASCADE,
  material VARCHAR(100),
  dimensions VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS CleaningDetails (
  cleaning_id INT PRIMARY KEY REFERENCES Products(product_id) ON DELETE CASCADE,
  volume_ml INT,
  usage TEXT
);

CREATE TABLE IF NOT EXISTS Orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES Users(user_id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS OrderDetails (
  order_detail_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES Products(product_id),
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Payments (
  payment_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  method VARCHAR(50),
  amount DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS Shipments (
  shipment_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  shipping_address VARCHAR(255),
  shipped_date TIMESTAMP,
  status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES Users(user_id),
  product_id INT NOT NULL REFERENCES Products(product_id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Script thêm dữ liệu từ file Data_CatShop.txt
const insertDataSQL = `
INSERT INTO Roles (role_name) VALUES
('Admin'),
('Customer')
ON CONFLICT DO NOTHING;

INSERT INTO ProductTypes (type_name) VALUES
('Cat'),
('Food'),
('Cage'),
('Cleaning'),
('Toy')
ON CONFLICT DO NOTHING;

INSERT INTO Categories (category_name, description, type_id) VALUES
('Persian', 'Fluffy and gentle breed', 1),
('Siamese', 'Vocal and affectionate breed', 1),
('Dry Food (Kitten)', 'High protein formula for growing kittens', 2),
('Wet Food (Adult)', 'Hydrating meal for adult cat maintenance', 2),
('Litter Boxes', 'Various styles of litter housings', 3),
('Carriers', 'Secure and comfortable carriers for transport', 3),
('Shampoo & Conditioner', 'Products for coat cleaning and conditioning', 4),
('Litter Deodorizers', 'Products to control and neutralize litter odors', 4),
('Scratching Posts', 'Durable posts for claw health and furniture protection', 5),
('Interactive Toys', 'Toys designed for mental and physical stimulation', 5)
ON CONFLICT DO NOTHING;

INSERT INTO Users (username, password_hash, email, phone, address, role_id) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@catshop.com', '0123456789', '123 Admin Street, Ho Chi Minh City', 1),
('jane_doe', 'bcrypt_hash_placeholder_jane', 'jane.doe@example.com', '0987654321', '456 Oak Ave, HCMC', 2),
('john_smith', 'bcrypt_hash_placeholder_john', 'john.smith@example.com', '0912345678', '789 Pine Ln, Da Nang', 2),
('alice_kim', 'bcrypt_hash_placeholder_alice', 'alice.kim@example.com', '0901122334', '101 Elm Blvd, Hanoi', 2),
('bob_jones', 'bcrypt_hash_placeholder_bob', 'bob.jones@example.com', '0975544332', '202 Maple Dr, HCMC', 2),
('charlie_wu', 'bcrypt_hash_placeholder_charlie', 'charlie.wu@example.com', '0938877665', '303 Birch Pl, Hue', 2),
('diana_lee', 'bcrypt_hash_placeholder_diana', 'diana.lee@example.com', '0966554433', '404 Cedar St, Can Tho', 2),
('eve_adams', 'bcrypt_hash_placeholder_eve', 'eve.adams@example.com', '0944332211', '505 Willow Way, Hanoi', 2),
('frank_bell', 'bcrypt_hash_placeholder_frank', 'frank.bell@example.com', '0922110099', '606 Ash Rd, Hai Phong', 2),
('grace_chen', 'bcrypt_hash_placeholder_grace', 'grace.chen@example.com', '0955667788', '707 Poplar Pkwy, HCMC', 2)
ON CONFLICT DO NOTHING;

INSERT INTO Products (product_name, type_id, category_id, price, stock_quantity, description, image_url) VALUES
-- Cats (type_id = 1) - total 10
('Fluffy Persian Kitten (M)', 1, 1, 750.00, 1, '8-week-old male Persian, very playful.', 'url_cat1'),
('Sweet Siamese Cat (F)', 1, 2, 450.00, 1, '1-year-old female Siamese, loves to cuddle.', 'url_cat2'),
('Munchkin Kitten (M)', 1, NULL, 800.00, 1, '6-month-old male Munchkin, short legs.', 'url_cat3'),
('Blue Point Siamese (M)', 1, 2, 550.00, 1, 'Adult male Siamese, striking blue eyes.', 'url_cat4'),
('Exotic Shorthair (F)', 1, 1, 680.00, 1, 'Young female Persian mix, short coat.', 'url_cat5'),
('Chinchilla Persian (F)', 1, 1, 900.00, 1, 'Beautiful silver coat, very rare.', 'url_cat6'),
('Seal Point Siamese (F)', 1, 2, 400.00, 1, 'Small female Siamese, active and curious.', 'url_cat7'),
('Tabby Mix Kitten (M)', 1, NULL, 300.00, 1, 'Friendly rescue kitten, needs a home.', 'url_cat8'),
('Ragdoll Cat (M)', 1, NULL, 780.00, 1, 'Calm and floppy Ragdoll, perfect lap cat.', 'url_cat9'),
('Himalayan Kitten (F)', 1, 1, 850.00, 1, 'Long-haired Persian variant, very sweet.', 'url_cat10'),
-- Food (type_id = 2) - total 10
('Premium Kitten Dry Food', 2, 3, 45.99, 50, '2kg bag, essential nutrients for kittens.', 'url_food1'),
('Adult Chicken Wet Food Can', 2, 4, 1.50, 200, 'Single can of high-moisture chicken food.', 'url_food2'),
('Grain-Free Adult Dry Food', 2, 3, 35.00, 30, '5kg bag, sensitive stomach formula.', 'url_food3'),
('Senior Salmon Wet Food Pouch', 2, 4, 10.50, 120, 'Pack of 12 pouches for older cats.', 'url_food4'),
('Large Bag Kitten Dry Food', 2, 3, 75.99, 15, '10kg bag, best value.', 'url_food5'),
('Tuna & Shrimp Wet Food', 2, 4, 1.75, 180, 'Gourmet flavor single can.', 'url_food6'),
('Specialized Hairball Formula', 2, 3, 40.00, 25, '3kg bag, helps with hairball control.', 'url_food7'),
('Vegetarian Wet Food', 2, 4, 12.99, 90, 'Pack of 6 vegetarian-friendly cans.', 'url_food8'),
('Weight Control Dry Food', 2, 3, 30.00, 40, '4kg bag, low-calorie formula.', 'url_food9'),
('Milk Replacer for Kittens', 2, 4, 15.00, 50, 'Powdered formula for young kittens.', 'url_food10'),
-- Cages (type_id = 3) - total 5
('Basic Litter Box', 3, 5, 25.00, 20, 'Simple plastic litter pan.', 'url_cage1'),
('Large Pet Carrier', 3, 6, 75.00, 10, 'Airline-approved plastic carrier.', 'url_cage2'),
('Enclosed Litter Box', 3, 5, 50.00, 15, 'Box with a hood for privacy.', 'url_cage3'),
('Soft-Sided Travel Carrier', 3, 6, 45.00, 12, 'Collapsible fabric carrier.', 'url_cage4'),
('Luxury Cat Condo Cage', 3, NULL, 150.00, 5, 'Multi-level living space for one cat.', 'url_cage5'),
-- Cleaning (type_id = 4) - total 5
('Odor Eliminator Spray', 4, 8, 12.99, 70, 'Enzymatic cleaner for urine odors.', 'url_clean1'),
('Gentle Cat Shampoo', 4, 7, 8.50, 50, 'Tearless formula for sensitive skin.', 'url_clean2'),
('Litter Box Deodorizing Powder', 4, 8, 5.99, 80, 'Shake-on powder for litter freshness.', 'url_clean3'),
('Waterless Foam Shampoo', 4, 7, 10.00, 60, 'Quick clean without bathing.', 'url_clean4'),
('Stain Remover & Cleaner', 4, 8, 15.99, 45, 'Heavy-duty spot cleaner.', 'url_clean5'),
-- Toys (type_id = 5) - total 10
('Feather Wand Toy', 5, 10, 8.00, 100, 'Classic feather toy for interactive play.', 'url_toy1'),
('Small Sisal Scratching Post', 5, 9, 15.00, 40, 'Compact post for small spaces.', 'url_toy2'),
('Electronic Mouse Toy', 5, 10, 25.00, 30, 'Battery-operated moving mouse.', 'url_toy3'),
('Catnip Mice Set (5-pack)', 5, 10, 5.00, 120, 'Small plush mice filled with catnip.', 'url_toy4'),
('Large Cardboard Scratcher', 5, 9, 20.00, 50, 'Flat scratcher with catnip included.', 'url_toy5'),
('Laser Pointer Toy', 5, 10, 3.50, 150, 'LED light toy for chasing.', 'url_toy6'),
('Tunnel for Play', 5, 10, 18.00, 20, 'Crinkly fabric tunnel.', 'url_toy7'),
('Vertical Sisal Post', 5, 9, 30.00, 15, 'Tall scratching post with a base.', 'url_toy8'),
('Puzzle Food Dispenser', 5, 10, 12.00, 40, 'Interactive toy that dispenses kibble.', 'url_toy9'),
('Ball and Track Toy', 5, 10, 10.00, 60, 'Circular track with a spinning ball.', 'url_toy10')
ON CONFLICT DO NOTHING;

INSERT INTO CatDetails (cat_id, breed, age, gender, vaccinated) VALUES
(1, 'Persian', 0, 'Male', TRUE),
(2, 'Siamese', 1, 'Female', TRUE),
(3, 'Munchkin', 0, 'Male', TRUE),
(4, 'Siamese', 2, 'Male', TRUE),
(5, 'Exotic Shorthair', 1, 'Female', TRUE),
(6, 'Persian', 3, 'Female', TRUE),
(7, 'Siamese', 1, 'Female', TRUE),
(8, 'Domestic Short Hair', 0, 'Male', FALSE),
(9, 'Ragdoll', 2, 'Male', TRUE),
(10, 'Himalayan', 0, 'Female', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO FoodDetails (food_id, weight_kg, ingredients, expiry_date) VALUES
(11, 2.00, 'Chicken, Rice, Essential Vitamins and Minerals', '2026-03-01'),
(12, 0.40, 'Chicken Broth, Meat, Liver', '2025-11-15'),
(13, 5.00, 'Salmon, Sweet Potato, Peas, Grain-Free', '2026-01-20'),
(14, 1.00, 'Salmon, Fish Broth, Senior Formula', '2025-12-05'),
(15, 10.00, 'Chicken, Corn, Wheat, Large Bag Value', '2026-04-10'),
(16, 0.40, 'Tuna, Shrimp, Water, Gourmet Flavor', '2025-10-25'),
(17, 3.00, 'Chicken, High Fiber Content, Fish Oil', '2026-02-01'),
(18, 0.50, 'Assorted Vegetables, Water, Vegan Friendly', '2025-12-10'),
(19, 4.00, 'Turkey, Oats, L-Carnitine for Weight Management', '2026-01-01'),
(20, 0.20, 'Milk Solids, Essential Taurine, Powdered Formula', '2025-11-01')
ON CONFLICT DO NOTHING;

INSERT INTO CageDetails (cage_id, material, dimensions) VALUES
(21, 'Plastic', '40x30x15cm'),
(22, 'Hard Plastic', '50x35x35cm'),
(23, 'Plastic', '55x45x45cm'),
(24, 'Fabric', '45x30x30cm'),
(25, 'Metal/Plastic', '100x60x150cm')
ON CONFLICT DO NOTHING;

INSERT INTO CleaningDetails (cleaning_id, volume_ml, usage) VALUES
(26, 500, 'Spray on affected area, wait 5 min, blot clean.'),
(27, 300, 'Apply to wet coat, lather, rinse well.'),
(28, 200, 'Sprinkle over litter, mix gently.'),
(29, 150, 'Apply foam to coat, massage, brush out.'),
(30, 750, 'Spray directly on stain, scrub with brush.')
ON CONFLICT DO NOTHING;
`;

async function initializeDatabase() {
  console.log("🚀 Bắt đầu khởi tạo cơ sở dữ liệu CatShop...");
  
  try {
    // Test kết nối
    console.log("\n📡 Đang kiểm tra kết nối database...");
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, version() as postgres_version");
    client.release();
    
    console.log("✅ Kết nối PostgreSQL thành công!");
    console.log("⏰ Thời gian hiện tại:", result.rows[0].current_time);
    console.log("📊 Phiên bản PostgreSQL:", result.rows[0].postgres_version);

    // Tạo bảng
    console.log("\n🏗️  Đang tạo các bảng...");
    await pool.query(createTablesSQL);
    console.log("✅ Tất cả các bảng đã được tạo thành công!");

    // Thêm dữ liệu mẫu
    console.log("\n🌱 Đang thêm dữ liệu mẫu...");
    await pool.query(insertDataSQL);
    console.log("✅ Dữ liệu mẫu đã được thêm thành công!");

    console.log("\n🎉 Khởi tạo cơ sở dữ liệu hoàn tất!");
    console.log("📊 Database CatShop đã sẵn sàng sử dụng!");
    
  } catch (error) {
    console.error("❌ Lỗi trong quá trình khởi tạo:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy script nếu được gọi trực tiếp
initializeDatabase().catch(console.error);

export { initializeDatabase };
