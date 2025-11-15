<?php
// Database configuration
// These values will be set during installation
$db_host = 'localhost';
$db_name = 'eztweak_db';
$db_user = 'eztweak_user';
$db_pass = 'your_password_here';

// Create database connection
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

// Session configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Security settings
define('JWT_SECRET', 'your-secret-key-change-this-in-production');
define('SESSION_TIMEOUT', 3600 * 24 * 7); // 7 days

// Application settings
define('SITE_NAME', 'EzTweak');
define('BASE_URL', 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']));
?>
