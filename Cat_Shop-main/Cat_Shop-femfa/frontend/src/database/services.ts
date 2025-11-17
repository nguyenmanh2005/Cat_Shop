import pool from "./schema";
import { 
  User, Role, Product, ProductType, Category, 
  Order, OrderDetail, Payment, Shipment, Review,
  CatDetail, FoodDetail, CageDetail, CleaningDetail 
} from "./schema";

// Role Service
export class RoleService {
  static async getAllRoles(): Promise<Role[]> {
    const result = await pool.query('SELECT * FROM Roles ORDER BY role_name');
    return result.rows;
  }

  static async getRoleById(id: number): Promise<Role | null> {
    const result = await pool.query('SELECT * FROM Roles WHERE role_id = $1', [id]);
    return result.rows[0] || null;
  }
}

// User Service
export class UserService {
  static async createUser(userData: Omit<User, 'user_id'>): Promise<User> {
    const { username, password_hash, email, phone, address, role_id } = userData;
    const result = await pool.query(
      `INSERT INTO Users (username, password_hash, email, phone, address, role_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [username, password_hash, email, phone, address, role_id]
    );
    return result.rows[0];
  }

  static async getUserById(id: number): Promise<User | null> {
    const result = await pool.query(`
      SELECT u.*, r.role_name 
      FROM Users u 
      LEFT JOIN Roles r ON u.role_id = r.role_id 
      WHERE u.user_id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query(`
      SELECT u.*, r.role_name 
      FROM Users u 
      LEFT JOIN Roles r ON u.role_id = r.role_id 
      WHERE u.email = $1
    `, [email]);
    return result.rows[0] || null;
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const result = await pool.query(`
      SELECT u.*, r.role_name 
      FROM Users u 
      LEFT JOIN Roles r ON u.role_id = r.role_id 
      WHERE u.username = $1
    `, [username]);
    return result.rows[0] || null;
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await pool.query(`
      SELECT u.*, r.role_name 
      FROM Users u 
      LEFT JOIN Roles r ON u.role_id = r.role_id 
      ORDER BY u.user_id DESC
    `);
    return result.rows;
  }

  static async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const fields = Object.keys(userData).filter(key => key !== 'user_id' && key !== 'role');
    const values = fields.map((field, index) => `${field} = $${index + 2}`);
    const query = `UPDATE Users SET ${values.join(', ')} WHERE user_id = $1 RETURNING *`;
    const params = [id, ...fields.map(field => userData[field as keyof User])];
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  static async deleteUser(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM Users WHERE user_id = $1', [id]);
    return result.rowCount > 0;
  }
}

// ProductType Service
export class ProductTypeService {
  static async getAllProductTypes(): Promise<ProductType[]> {
    const result = await pool.query('SELECT * FROM ProductTypes ORDER BY type_name');
    return result.rows;
  }

  static async getProductTypeById(id: number): Promise<ProductType | null> {
    const result = await pool.query('SELECT * FROM ProductTypes WHERE type_id = $1', [id]);
    return result.rows[0] || null;
  }
}

// Category Service
export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    const result = await pool.query(`
      SELECT c.*, pt.type_name 
      FROM Categories c 
      LEFT JOIN ProductTypes pt ON c.type_id = pt.type_id 
      ORDER BY c.category_name
    `);
    return result.rows;
  }

  static async getCategoriesByType(typeId: number): Promise<Category[]> {
    const result = await pool.query(`
      SELECT c.*, pt.type_name 
      FROM Categories c 
      LEFT JOIN ProductTypes pt ON c.type_id = pt.type_id 
      WHERE c.type_id = $1 
      ORDER BY c.category_name
    `, [typeId]);
    return result.rows;
  }

  static async getCategoryById(id: number): Promise<Category | null> {
    const result = await pool.query(`
      SELECT c.*, pt.type_name 
      FROM Categories c 
      LEFT JOIN ProductTypes pt ON c.type_id = pt.type_id 
      WHERE c.category_id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async createCategory(categoryData: Omit<Category, 'category_id'>): Promise<Category> {
    const { category_name, description, type_id } = categoryData;
    const result = await pool.query(
      `INSERT INTO Categories (category_name, description, type_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [category_name, description, type_id]
    );
    return result.rows[0];
  }

  static async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | null> {
    const fields = Object.keys(categoryData).filter(key => key !== 'category_id' && key !== 'type');
    const values = fields.map((field, index) => `${field} = $${index + 2}`);
    const query = `UPDATE Categories SET ${values.join(', ')} WHERE category_id = $1 RETURNING *`;
    const params = [id, ...fields.map(field => categoryData[field as keyof Category])];
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  static async deleteCategory(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM Categories WHERE category_id = $1', [id]);
    return result.rowCount > 0;
  }
}

// Product Service
export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    const result = await pool.query(`
      SELECT p.*, pt.type_name, c.category_name 
      FROM Products p 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      ORDER BY p.product_id DESC
    `);
    return result.rows;
  }

  static async getProductsByType(typeId: number): Promise<Product[]> {
    const result = await pool.query(`
      SELECT p.*, pt.type_name, c.category_name 
      FROM Products p 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      WHERE p.type_id = $1 
      ORDER BY p.product_id DESC
    `, [typeId]);
    return result.rows;
  }

  static async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const result = await pool.query(`
      SELECT p.*, pt.type_name, c.category_name 
      FROM Products p 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      WHERE p.category_id = $1 
      ORDER BY p.product_id DESC
    `, [categoryId]);
    return result.rows;
  }

  static async getProductById(id: number): Promise<Product | null> {
    const result = await pool.query(`
      SELECT p.*, pt.type_name, c.category_name 
      FROM Products p 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      WHERE p.product_id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    const result = await pool.query(`
      SELECT p.*, pt.type_name, c.category_name 
      FROM Products p 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      WHERE p.product_name ILIKE $1 OR p.description ILIKE $1
      ORDER BY p.product_id DESC
    `, [`%${searchTerm}%`]);
    return result.rows;
  }

  static async createProduct(productData: Omit<Product, 'product_id'>): Promise<Product> {
    const { product_name, type_id, category_id, price, stock_quantity, description, image_url } = productData;
    const result = await pool.query(
      `INSERT INTO Products (product_name, type_id, category_id, price, stock_quantity, description, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [product_name, type_id, category_id, price, stock_quantity, description, image_url]
    );
    return result.rows[0];
  }

  static async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
    const fields = Object.keys(productData).filter(key => key !== 'product_id' && key !== 'type' && key !== 'category');
    const values = fields.map((field, index) => `${field} = $${index + 2}`);
    const query = `UPDATE Products SET ${values.join(', ')} WHERE product_id = $1 RETURNING *`;
    const params = [id, ...fields.map(field => productData[field as keyof Product])];
    
    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  static async deleteProduct(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM Products WHERE product_id = $1', [id]);
    return result.rowCount > 0;
  }
}

// CatDetail Service
export class CatDetailService {
  static async getCatDetailById(catId: number): Promise<CatDetail | null> {
    const result = await pool.query(`
      SELECT cd.*, p.*, pt.type_name, c.category_name 
      FROM CatDetails cd 
      LEFT JOIN Products p ON cd.cat_id = p.product_id 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      WHERE cd.cat_id = $1
    `, [catId]);
    return result.rows[0] || null;
  }

  static async getAllCatDetails(): Promise<CatDetail[]> {
    const result = await pool.query(`
      SELECT cd.*, p.*, pt.type_name, c.category_name 
      FROM CatDetails cd 
      LEFT JOIN Products p ON cd.cat_id = p.product_id 
      LEFT JOIN ProductTypes pt ON p.type_id = pt.type_id 
      LEFT JOIN Categories c ON p.category_id = c.category_id 
      ORDER BY cd.cat_id DESC
    `);
    return result.rows;
  }

  static async createCatDetail(catData: Omit<CatDetail, 'cat_id'>): Promise<CatDetail> {
    const { breed, age, gender, vaccinated } = catData;
    const result = await pool.query(
      `INSERT INTO CatDetails (breed, age, gender, vaccinated) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [breed, age, gender, vaccinated]
    );
    return result.rows[0];
  }
}

// Order Service
export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    const result = await pool.query(`
      SELECT o.*, u.username, u.email 
      FROM Orders o 
      LEFT JOIN Users u ON o.user_id = u.user_id 
      ORDER BY o.order_date DESC
    `);
    return result.rows;
  }

  static async getOrdersByUserId(userId: number): Promise<Order[]> {
    const result = await pool.query(`
      SELECT o.*, u.username, u.email 
      FROM Orders o 
      LEFT JOIN Users u ON o.user_id = u.user_id 
      WHERE o.user_id = $1 
      ORDER BY o.order_date DESC
    `, [userId]);
    return result.rows;
  }

  static async getOrderById(id: number): Promise<Order | null> {
    const result = await pool.query(`
      SELECT o.*, u.username, u.email 
      FROM Orders o 
      LEFT JOIN Users u ON o.user_id = u.user_id 
      WHERE o.order_id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
    const result = await pool.query(`
      SELECT od.*, p.product_name, p.image_url 
      FROM OrderDetails od 
      LEFT JOIN Products p ON od.product_id = p.product_id 
      WHERE od.order_id = $1
    `, [orderId]);
    return result.rows;
  }

  static async createOrder(orderData: Omit<Order, 'order_id' | 'order_date'>): Promise<Order> {
    const { user_id, status, total_amount } = orderData;
    const result = await pool.query(
      `INSERT INTO Orders (user_id, status, total_amount) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [user_id, status || 'pending', total_amount]
    );
    return result.rows[0];
  }

  static async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    const result = await pool.query(
      'UPDATE Orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }
}

// Review Service
export class ReviewService {
  static async getReviewsByProduct(productId: number): Promise<Review[]> {
    const result = await pool.query(`
      SELECT r.*, u.username 
      FROM Reviews r 
      LEFT JOIN Users u ON r.user_id = u.user_id 
      WHERE r.product_id = $1 
      ORDER BY r.created_at DESC
    `, [productId]);
    return result.rows;
  }

  static async createReview(reviewData: Omit<Review, 'review_id' | 'created_at'>): Promise<Review> {
    const { user_id, product_id, rating, comment } = reviewData;
    const result = await pool.query(
      `INSERT INTO Reviews (user_id, product_id, rating, comment) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [user_id, product_id, rating, comment]
    );
    return result.rows[0];
  }
}












