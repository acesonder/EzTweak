import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../../eztweak.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
export const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('client', 'staff', 'admin')),
        full_name TEXT,
        phone TEXT,
        address TEXT,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        color TEXT DEFAULT '#4a90e2',
        font_color TEXT DEFAULT '#ffffff',
        icon_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        staff_id INTEGER,
        status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')),
        order_type TEXT NOT NULL CHECK(order_type IN ('delivery', 'pickup')),
        delivery_address TEXT,
        delivery_date DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (staff_id) REFERENCES users(id)
      )
    `);

    // Order items table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Cases table
    db.run(`
      CREATE TABLE IF NOT EXISTS cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'closed')),
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (staff_id) REFERENCES users(id)
      )
    `);

    // Case notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS case_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        note TEXT NOT NULL,
        is_private BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES users(id)
      )
    `);

    // Incidents table
    db.run(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        incident_type TEXT NOT NULL,
        severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')),
        location TEXT,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('reported', 'investigating', 'resolved')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id)
      )
    `);

    // Referrals table
    db.run(`
      CREATE TABLE IF NOT EXISTS referrals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        service_provider TEXT NOT NULL,
        service_type TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'completed', 'declined')),
        notes TEXT,
        outcome TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES users(id),
        FOREIGN KEY (staff_id) REFERENCES users(id)
      )
    `);

    // User favorites table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      )
    `);

    // Seed initial data
    seedDatabase();
  });
};

const seedDatabase = () => {
  // Check if admin user exists
  db.get('SELECT id FROM users WHERE username = ?', ['admin'], async (err, row) => {
    if (!row) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(
        'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@eztweak.com', hashedPassword, 'admin', 'System Administrator']
      );
    }
  });

  // Seed initial products
  const products = [
    { name: 'Syringes (1ml)', description: 'Single-use sterile syringes', category: 'Needles & Syringes', stock: 500, color: '#4a90e2', icon: 'syringe' },
    { name: 'Naloxone Kit', description: 'Opioid overdose reversal kit', category: 'Emergency Supplies', stock: 100, color: '#e74c3c', icon: 'naloxone' },
    { name: 'Alcohol Swabs', description: 'Sterile alcohol prep pads', category: 'Cleaning Supplies', stock: 1000, color: '#2ecc71', icon: 'swab' },
    { name: 'Sharps Container', description: 'Safe needle disposal container', category: 'Safety Equipment', stock: 50, color: '#f39c12', icon: 'container' },
    { name: 'Condoms', description: 'Latex protection', category: 'Safer Sex', stock: 500, color: '#9b59b6', icon: 'condom' },
    { name: 'Sterile Water', description: 'Single-use sterile water vials', category: 'Mixing Supplies', stock: 300, color: '#3498db', icon: 'water' },
    { name: 'Cookers', description: 'Heat-resistant mixing cookers', category: 'Mixing Supplies', stock: 200, color: '#95a5a6', icon: 'cooker' },
    { name: 'Cotton Filters', description: 'Sterile cotton filters', category: 'Filtering Supplies', stock: 400, color: '#ecf0f1', icon: 'filter' },
    { name: 'Tourniquets', description: 'Medical-grade tourniquets', category: 'Injection Supplies', stock: 150, color: '#e67e22', icon: 'tourniquet' },
    { name: 'Bandages', description: 'Adhesive bandages assorted sizes', category: 'First Aid', stock: 600, color: '#1abc9c', icon: 'bandage' }
  ];

  db.get('SELECT id FROM products LIMIT 1', (err, row) => {
    if (!row) {
      const stmt = db.prepare('INSERT INTO products (name, description, category, stock_quantity, color, font_color, icon_url) VALUES (?, ?, ?, ?, ?, ?, ?)');
      products.forEach(product => {
        stmt.run(product.name, product.description, product.category, product.stock, product.color, '#ffffff', `/icons/${product.icon}.svg`);
      });
      stmt.finalize();
    }
  });
};

export default db;
