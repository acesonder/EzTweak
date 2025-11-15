<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

requireLogin();

$pageTitle = 'Dashboard - ' . SITE_NAME;

// Get dashboard statistics
$userId = getCurrentUserId();
$userRole = getCurrentUserRole();

// Get counts based on role
$stats = [];

try {
    if ($userRole === 'admin') {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $stats['users'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM orders");
        $stats['orders'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM cases");
        $stats['cases'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM incidents");
        $stats['incidents'] = $stmt->fetch()['count'];
    } elseif ($userRole === 'staff') {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM orders WHERE staff_id = ?");
        $stmt->execute([$userId]);
        $stats['my_orders'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM cases WHERE staff_id = ?");
        $stmt->execute([$userId]);
        $stats['my_cases'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
        $stmt->execute();
        $stats['pending_orders'] = $stmt->fetch()['count'];
    } else {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM orders WHERE client_id = ?");
        $stmt->execute([$userId]);
        $stats['my_orders'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM cases WHERE client_id = ?");
        $stmt->execute([$userId]);
        $stats['my_cases'] = $stmt->fetch()['count'];
        
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM orders WHERE client_id = ? AND status = 'pending'");
        $stmt->execute([$userId]);
        $stats['pending_orders'] = $stmt->fetch()['count'];
    }
    
    // Get recent orders
    if ($userRole === 'client') {
        $stmt = $pdo->prepare("
            SELECT o.*, u.username as staff_name 
            FROM orders o 
            LEFT JOIN users u ON o.staff_id = u.id 
            WHERE o.client_id = ? 
            ORDER BY o.created_at DESC 
            LIMIT 5
        ");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->prepare("
            SELECT o.*, c.username as client_name, s.username as staff_name 
            FROM orders o 
            LEFT JOIN users c ON o.client_id = c.id
            LEFT JOIN users s ON o.staff_id = s.id
            ORDER BY o.created_at DESC 
            LIMIT 5
        ");
        $stmt->execute();
    }
    $recentOrders = $stmt->fetchAll();
    
} catch (PDOException $e) {
    error_log("Dashboard error: " . $e->getMessage());
    $stats = [];
    $recentOrders = [];
}

include 'includes/header.php';
?>

<div class="container">
    <div class="dashboard-header">
        <h1>Welcome, <?php echo htmlspecialchars($_SESSION['full_name'] ?: $_SESSION['username']); ?>!</h1>
        <p class="user-role">Role: <?php echo ucfirst($userRole); ?></p>
    </div>
    
    <div class="stats-grid">
        <?php if ($userRole === 'admin'): ?>
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3><?php echo $stats['users'] ?? 0; ?></h3>
                    <p>Total Users</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <h3><?php echo $stats['orders'] ?? 0; ?></h3>
                    <p>Total Orders</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                    <h3><?php echo $stats['cases'] ?? 0; ?></h3>
                    <p>Total Cases</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⚠️</div>
                <div class="stat-content">
                    <h3><?php echo $stats['incidents'] ?? 0; ?></h3>
                    <p>Total Incidents</p>
                </div>
            </div>
        <?php else: ?>
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <h3><?php echo $stats['my_orders'] ?? 0; ?></h3>
                    <p>My Orders</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <h3><?php echo $stats['pending_orders'] ?? 0; ?></h3>
                    <p>Pending Orders</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                    <h3><?php echo $stats['my_cases'] ?? 0; ?></h3>
                    <p>My Cases</p>
                </div>
            </div>
        <?php endif; ?>
    </div>
    
    <div class="dashboard-actions">
        <a href="products.php" class="action-btn primary">
            <span class="btn-icon">🛍️</span>
            Browse Products
        </a>
        <a href="orders.php?action=create" class="action-btn secondary">
            <span class="btn-icon">➕</span>
            Create New Order
        </a>
        <?php if ($userRole !== 'client'): ?>
        <a href="cases.php" class="action-btn">
            <span class="btn-icon">📝</span>
            Manage Cases
        </a>
        <?php endif; ?>
    </div>
    
    <?php if (!empty($recentOrders)): ?>
    <div class="card">
        <h2>Recent Orders</h2>
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <?php if ($userRole !== 'client'): ?>
                        <th>Client</th>
                        <?php endif; ?>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($recentOrders as $order): ?>
                    <tr>
                        <td>#<?php echo $order['id']; ?></td>
                        <?php if ($userRole !== 'client'): ?>
                        <td><?php echo htmlspecialchars($order['client_name'] ?? 'N/A'); ?></td>
                        <?php endif; ?>
                        <td><?php echo ucfirst($order['order_type']); ?></td>
                        <td>
                            <span class="status-badge status-<?php echo $order['status']; ?>">
                                <?php echo ucfirst($order['status']); ?>
                            </span>
                        </td>
                        <td><?php echo formatDate($order['created_at']); ?></td>
                        <td>
                            <a href="orders.php?view=<?php echo $order['id']; ?>" class="btn-link">View</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <div class="card-footer">
            <a href="orders.php">View All Orders →</a>
        </div>
    </div>
    <?php endif; ?>
</div>

<?php include 'includes/footer.php'; ?>
