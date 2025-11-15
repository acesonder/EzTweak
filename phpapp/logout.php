<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Log the logout activity
if (isLoggedIn()) {
    logActivity(getCurrentUserId(), 'logout', 'User logged out');
}

// Clear session
session_destroy();

// Redirect to login page
header('Location: login.php?logout=success');
exit();
?>
