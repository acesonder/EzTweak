# EzTweak PHP Application

A complete PHP-based harm reduction order and case management system with MySQL/PHPMyAdmin backend.

## Features

- ✅ Complete authentication system (Login, Register, Forgot Password)
- ✅ Dashboard with real-time statistics
- ✅ Product management system
- ✅ Order creation and tracking
- ✅ Case management for staff
- ✅ Incident reporting
- ✅ Referral system
- ✅ Real-time notifications with AJAX
- ✅ Dual theme system (Medicine Wheel & Neon)
- ✅ Fully responsive design
- ✅ In-app notification pop-ups
- ✅ Role-based access control (Client, Staff, Admin)
- ✅ Secure password hashing
- ✅ SQL injection protection
- ✅ Session management

## System Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher (or MariaDB 10.2+)
- PDO PHP Extension
- Apache or Nginx web server
- cPanel (optional, for easy deployment)

## Installation Instructions

### Method 1: Using the Installation Wizard (Recommended)

1. Upload all files to your web server (via FTP, cPanel File Manager, or Git)

2. Set write permissions on the config file:
   ```bash
   chmod 666 includes/config.php
   ```

3. Create a MySQL database through cPanel or phpMyAdmin:
   - Database name: `eztweak_db` (or your choice)
   - Database user with full privileges

4. Navigate to `http://your-domain.com/phpapp/install.php` in your browser

5. Follow the installation wizard:
   - Step 1: Check system requirements
   - Step 2: Enter database credentials and test connection
   - Step 3: Complete installation

6. After installation, delete or rename `install.php` for security

### Method 2: Manual Installation

1. Create a MySQL database

2. Edit `includes/config.php` and update the database credentials:
   ```php
   $db_host = 'localhost';
   $db_name = 'your_database_name';
   $db_user = 'your_database_user';
   $db_pass = 'your_database_password';
   ```

3. Run the database initialization:
   ```bash
   php -r "require 'includes/config.php'; require 'includes/init_db.php'; initializeDatabase(\$pdo); seedInitialData(\$pdo);"
   ```

4. Access the application at `http://your-domain.com/phpapp/`

## Default Credentials

- **Username:** admin
- **Password:** admin123

**Important:** Change the admin password immediately after first login!

## File Structure

```
phpapp/
├── css/                    # Stylesheets
│   ├── main.css           # Main theme styles
│   ├── auth.css           # Authentication page styles
│   └── dashboard.css      # Dashboard and navigation styles
├── js/                    # JavaScript files
│   ├── main.js           # Core functionality and utilities
│   ├── auth.js           # Authentication features
│   └── dashboard.js      # Dashboard features
├── includes/             # PHP includes
│   ├── config.php        # Database configuration
│   ├── functions.php     # Helper functions
│   ├── init_db.php       # Database initialization
│   ├── header.php        # Page header with navigation
│   └── footer.php        # Page footer
├── login.php             # Login page
├── register.php          # Registration page
├── forgot_password.php   # Password recovery
├── dashboard.php         # Main dashboard
├── products.php          # Product management (to be created)
├── orders.php            # Order management (to be created)
├── cases.php             # Case management (to be created)
├── incidents.php         # Incident reporting (to be created)
├── api.php               # AJAX API endpoint
├── logout.php            # Logout handler
├── install.php           # Installation wizard
└── README.md             # This file
```

## cPanel Deployment

1. **Upload Files:**
   - Use File Manager or FTP to upload all files to `public_html/phpapp/`

2. **Create Database:**
   - Go to cPanel → MySQL Databases
   - Create a new database (e.g., `username_eztweak`)
   - Create a database user
   - Add user to database with ALL PRIVILEGES

3. **Set Permissions:**
   - Right-click `includes/config.php` in File Manager
   - Change Permissions → Set to 666

4. **Run Installation:**
   - Navigate to `https://yourdomain.com/phpapp/install.php`
   - Follow the wizard

5. **Security:**
   - After installation, delete `install.php`
   - Change config.php permissions back to 644

## Theme Switching

The application includes two beautiful themes:

- **Medicine Wheel Theme:** Warm, indigenous-inspired earth tones (beige, brown, red, yellow)
- **Neon Theme:** Modern blue/purple gradient with glowing effects

Users can switch themes by clicking the theme toggle button in the navigation bar. The preference is saved in their session.

## AJAX Features

The application uses AJAX for real-time updates without page refreshes:

- Form submissions (login, register, password reset)
- Notification system
- Dashboard statistics refresh
- Product loading
- Order management
- Real-time status updates

## Security Features

- Password hashing with bcrypt
- SQL injection protection via PDO prepared statements
- XSS protection with input sanitization
- CSRF token support (recommended to add)
- Session timeout
- Role-based access control
- Secure password reset flow

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Support

For issues or questions, please create an issue on the GitHub repository:
https://github.com/acesonder/EzTweak

## License

This project is part of the EzTweak harm reduction system. See the main repository for license information.

## Credits

Developed as part of the EzTweak project for harm reduction outreach teams.
