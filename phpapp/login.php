<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

// If already logged in, redirect to dashboard
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit();
}

// Handle AJAX login request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ajax'])) {
    $username = sanitizeInput($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        jsonError('Username and password are required');
    }

    try {
        $stmt = $pdo->prepare("SELECT id, username, email, password, role, full_name, profile_image FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !verifyPassword($password, $user['password'])) {
            jsonError('Invalid credentials', 401);
        }

        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        $_SESSION['profile_image'] = $user['profile_image'];
        $_SESSION['last_activity'] = time();

        logActivity($user['id'], 'login', 'User logged in successfully');

        jsonSuccess('Login successful', [
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'full_name' => $user['full_name'],
                'profile_image' => $user['profile_image']
            ]
        ]);
    } catch (PDOException $e) {
        jsonError('Server error', 500);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?php echo SITE_NAME; ?></title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body class="auth-page" data-theme="<?php echo getTheme(); ?>">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <img src="https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a" alt="EzTweak Logo" class="auth-logo" id="theme-logo">
                <h1>Welcome to <?php echo SITE_NAME; ?></h1>
                <p>Harm Reduction Order & Case Management</p>
            </div>

            <form id="login-form" class="auth-form">
                <div id="error-message" class="error-message" style="display: none;"></div>
                
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required autofocus placeholder="Enter your username">
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="Enter your password">
                </div>

                <button type="submit" class="auth-button" id="login-button">
                    <span class="button-text">Login</span>
                    <span class="button-loading" style="display: none;">Logging in...</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>Don't have an account? <a href="register.php">Register here</a></p>
                <p><a href="forgot_password.php">Forgot password?</a></p>
                <p class="demo-info">
                    <strong>Demo Account:</strong><br>
                    Username: admin<br>
                    Password: admin123
                </p>
            </div>

            <div class="theme-toggle">
                <button type="button" onclick="toggleTheme()" class="theme-toggle-btn">
                    <span id="theme-icon">🌙</span> Switch Theme
                </button>
            </div>
        </div>
    </div>

    <script src="js/main.js"></script>
    <script src="js/auth.js"></script>
    <script>
        document.getElementById('login-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorDiv = document.getElementById('error-message');
            const button = document.getElementById('login-button');
            const buttonText = button.querySelector('.button-text');
            const buttonLoading = button.querySelector('.button-loading');
            
            // Hide error message
            errorDiv.style.display = 'none';
            
            // Show loading state
            button.disabled = true;
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'inline';
            
            const formData = new FormData(this);
            formData.append('ajax', '1');
            
            try {
                const response = await fetch('login.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.php';
                    }, 500);
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.style.display = 'block';
                    button.disabled = false;
                    buttonText.style.display = 'inline';
                    buttonLoading.style.display = 'none';
                }
            } catch (error) {
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
                button.disabled = false;
                buttonText.style.display = 'inline';
                buttonLoading.style.display = 'none';
            }
        });
    </script>
</body>
</html>
