<?php
// Database initialization script
// This creates all necessary tables and seeds initial data

function initializeDatabase($pdo) {
    try {
        // Users table
        $pdo->exec("CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('client', 'staff', 'admin') NOT NULL,
            full_name VARCHAR(100),
            phone VARCHAR(20),
            address TEXT,
            profile_image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Products table
        $pdo->exec("CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            stock_quantity INT DEFAULT 0,
            color VARCHAR(7) DEFAULT '#4a90e2',
            font_color VARCHAR(7) DEFAULT '#ffffff',
            icon_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Orders table
        $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            staff_id INT,
            status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
            order_type ENUM('delivery', 'pickup') NOT NULL,
            delivery_address TEXT,
            delivery_date DATETIME,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL,
            INDEX idx_client (client_id),
            INDEX idx_staff (staff_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Order items table
        $pdo->exec("CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            INDEX idx_order (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Cases table
        $pdo->exec("CREATE TABLE IF NOT EXISTS cases (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            staff_id INT NOT NULL,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status ENUM('open', 'in_progress', 'closed') NOT NULL DEFAULT 'open',
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_client (client_id),
            INDEX idx_staff (staff_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Case notes table
        $pdo->exec("CREATE TABLE IF NOT EXISTS case_notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT NOT NULL,
            staff_id INT NOT NULL,
            note TEXT NOT NULL,
            is_private TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
            FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_case (case_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Incidents table
        $pdo->exec("CREATE TABLE IF NOT EXISTS incidents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reporter_id INT NOT NULL,
            incident_type VARCHAR(100) NOT NULL,
            severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
            location VARCHAR(255),
            description TEXT NOT NULL,
            status ENUM('reported', 'investigating', 'resolved') NOT NULL DEFAULT 'reported',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_reporter (reporter_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Referrals table
        $pdo->exec("CREATE TABLE IF NOT EXISTS referrals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            staff_id INT NOT NULL,
            service_provider VARCHAR(200) NOT NULL,
            service_type VARCHAR(100) NOT NULL,
            status ENUM('pending', 'accepted', 'completed', 'declined') NOT NULL DEFAULT 'pending',
            notes TEXT,
            outcome TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_client (client_id),
            INDEX idx_staff (staff_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // User favorites table
        $pdo->exec("CREATE TABLE IF NOT EXISTS user_favorites (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE KEY unique_favorite (user_id, product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Notifications table
        $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            message TEXT NOT NULL,
            type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
            is_read TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user (user_id),
            INDEX idx_read (is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Activity logs table
        $pdo->exec("CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        return true;
    } catch (PDOException $e) {
        error_log("Database initialization error: " . $e->getMessage());
        return false;
    }
}

function seedInitialData($pdo) {
    try {
        // Check if admin user exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
        $stmt->execute(['admin']);
        
        if ($stmt->fetchColumn() == 0) {
            // Create admin user
            $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT, ['cost' => 10]);
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['admin', 'admin@eztweak.com', $hashedPassword, 'admin', 'System Administrator']);
        }

        // Check if products exist
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM products");
        $stmt->execute();
        
        if ($stmt->fetchColumn() == 0) {
            // Seed products
            $products = [
                ['Syringes (1ml)', 'Single-use sterile syringes', 'Needles & Syringes', 500, '#4a90e2', '#ffffff', '/icons/syringe.svg'],
                ['Naloxone Kit', 'Opioid overdose reversal kit', 'Emergency Supplies', 100, '#e74c3c', '#ffffff', '/icons/naloxone.svg'],
                ['Alcohol Swabs', 'Sterile alcohol prep pads', 'Cleaning Supplies', 1000, '#2ecc71', '#ffffff', '/icons/swab.svg'],
                ['Sharps Container', 'Safe needle disposal container', 'Safety Equipment', 50, '#f39c12', '#ffffff', '/icons/container.svg'],
                ['Condoms', 'Latex protection', 'Safer Sex', 500, '#9b59b6', '#ffffff', '/icons/condom.svg'],
                ['Sterile Water', 'Single-use sterile water vials', 'Mixing Supplies', 300, '#3498db', '#ffffff', '/icons/water.svg'],
                ['Cookers', 'Heat-resistant mixing cookers', 'Mixing Supplies', 200, '#95a5a6', '#000000', '/icons/cooker.svg'],
                ['Cotton Filters', 'Sterile cotton filters', 'Filtering Supplies', 400, '#ecf0f1', '#000000', '/icons/filter.svg'],
                ['Tourniquets', 'Medical-grade tourniquets', 'Injection Supplies', 150, '#e67e22', '#ffffff', '/icons/tourniquet.svg'],
                ['Bandages', 'Adhesive bandages assorted sizes', 'First Aid', 600, '#1abc9c', '#ffffff', '/icons/bandage.svg']
            ];

            $stmt = $pdo->prepare("INSERT INTO products (name, description, category, stock_quantity, color, font_color, icon_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
            
            foreach ($products as $product) {
                $stmt->execute($product);
            }
        }

        return true;
    } catch (PDOException $e) {
        error_log("Data seeding error: " . $e->getMessage());
        return false;
    }
}
?>
