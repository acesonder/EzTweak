<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? SITE_NAME; ?></title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/dashboard.css">
</head>
<body data-theme="<?php echo getTheme(); ?>">
    <nav class="navbar">
        <div class="navbar-container">
            <div class="navbar-brand">
                <img src="https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a" 
                     alt="Logo" 
                     class="navbar-logo" 
                     id="theme-logo">
                <span class="navbar-title"><?php echo SITE_NAME; ?></span>
            </div>
            
            <button class="navbar-toggle" id="navbar-toggle">
                <span></span>
                <span></span>
                <span></span>
            </button>
            
            <div class="navbar-menu" id="navbar-menu">
                <a href="dashboard.php" class="navbar-item <?php echo basename($_SERVER['PHP_SELF']) == 'dashboard.php' ? 'active' : ''; ?>">
                    Dashboard
                </a>
                <a href="products.php" class="navbar-item <?php echo basename($_SERVER['PHP_SELF']) == 'products.php' ? 'active' : ''; ?>">
                    Products
                </a>
                <a href="orders.php" class="navbar-item <?php echo basename($_SERVER['PHP_SELF']) == 'orders.php' ? 'active' : ''; ?>">
                    Orders
                </a>
                <?php if (getCurrentUserRole() !== 'client'): ?>
                <a href="cases.php" class="navbar-item <?php echo basename($_SERVER['PHP_SELF']) == 'cases.php' ? 'active' : ''; ?>">
                    Cases
                </a>
                <a href="incidents.php" class="navbar-item <?php echo basename($_SERVER['PHP_SELF']) == 'incidents.php' ? 'active' : ''; ?>">
                    Incidents
                </a>
                <?php endif; ?>
                
                <div class="navbar-right">
                    <div class="navbar-item notification-icon" onclick="showNotificationsPanel()">
                        <span>🔔</span>
                        <span id="notification-badge" class="notification-badge" style="display: none;">0</span>
                    </div>
                    
                    <button onclick="toggleTheme()" class="navbar-item theme-btn">
                        <span id="theme-icon">🌙</span>
                    </button>
                    
                    <div class="navbar-item dropdown">
                        <button class="user-menu-btn" onclick="toggleUserMenu()">
                            <?php echo htmlspecialchars($_SESSION['username'] ?? 'User'); ?> ▼
                        </button>
                        <div class="dropdown-menu" id="user-menu">
                            <a href="profile.php" class="dropdown-item">Profile</a>
                            <a href="logout.php" class="dropdown-item">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
    
    <div class="notifications-panel" id="notifications-panel" style="display: none;">
        <div class="notifications-header">
            <h3>Notifications</h3>
            <button onclick="closeNotificationsPanel()">×</button>
        </div>
        <div class="notifications-list" id="notifications-list">
            <p class="no-notifications">No new notifications</p>
        </div>
    </div>
    
    <main class="main-content">
