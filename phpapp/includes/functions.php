<?php
// Authentication functions
function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['username']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit();
    }
}

function requireRole($allowedRoles) {
    requireLogin();
    if (!in_array($_SESSION['role'], $allowedRoles)) {
        http_response_code(403);
        die('Access denied');
    }
}

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

function getCurrentUserRole() {
    return $_SESSION['role'] ?? null;
}

// Sanitization functions
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// JSON response functions
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

function jsonError($message, $statusCode = 400) {
    jsonResponse(['success' => false, 'message' => $message], $statusCode);
}

function jsonSuccess($message, $data = []) {
    jsonResponse(array_merge(['success' => true, 'message' => $message], $data));
}

// Password functions
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Notification system
function addNotification($userId, $message, $type = 'info') {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $message, $type]);
}

function getUnreadNotifications($userId) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

function markNotificationRead($notificationId) {
    global $pdo;
    $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
    $stmt->execute([$notificationId]);
}

// Get theme preference
function getTheme() {
    return $_SESSION['theme'] ?? 'medicine-wheel';
}

function setTheme($theme) {
    if (in_array($theme, ['medicine-wheel', 'neon'])) {
        $_SESSION['theme'] = $theme;
        return true;
    }
    return false;
}

// Format date
function formatDate($date) {
    return date('M d, Y g:i A', strtotime($date));
}

// Logging function
function logActivity($userId, $action, $details = '') {
    global $pdo;
    $stmt = $pdo->prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)");
    $stmt->execute([$userId, $action, $details]);
}
?>
