<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Set JSON header
header('Content-Type: application/json');

// Only allow AJAX requests
if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
    // Allow GET requests for certain actions
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        jsonError('Invalid request', 403);
    }
}

$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {
        case 'set_theme':
            if (!isLoggedIn()) jsonError('Not authenticated', 401);
            $theme = $_POST['theme'] ?? '';
            if (setTheme($theme)) {
                jsonSuccess('Theme updated');
            } else {
                jsonError('Invalid theme');
            }
            break;
            
        case 'get_notifications':
            if (!isLoggedIn()) jsonError('Not authenticated', 401);
            $notifications = getUnreadNotifications(getCurrentUserId());
            jsonSuccess('Notifications retrieved', ['notifications' => $notifications]);
            break;
            
        case 'mark_notification_read':
            if (!isLoggedIn()) jsonError('Not authenticated', 401);
            $notificationId = $_POST['notification_id'] ?? 0;
            markNotificationRead($notificationId);
            jsonSuccess('Notification marked as read');
            break;
            
        case 'get_dashboard_stats':
            if (!isLoggedIn()) jsonError('Not authenticated', 401);
            $userId = getCurrentUserId();
            $userRole = getCurrentUserRole();
            $stats = [];
            
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
            
            jsonSuccess('Stats retrieved', ['stats' => $stats]);
            break;
            
        case 'get_products':
            if (!isLoggedIn()) jsonError('Not authenticated', 401);
            $stmt = $pdo->query("SELECT * FROM products ORDER BY name");
            $products = $stmt->fetchAll();
            jsonSuccess('Products retrieved', ['products' => $products]);
            break;
            
        default:
            jsonError('Invalid action', 400);
    }
} catch (PDOException $e) {
    error_log("API Error: " . $e->getMessage());
    jsonError('Server error', 500);
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    jsonError($e->getMessage(), 500);
}
?>
