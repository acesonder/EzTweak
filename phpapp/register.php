<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

// If already logged in, redirect to dashboard
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit();
}

// Handle AJAX registration request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ajax'])) {
    $username = sanitizeInput($_POST['username'] ?? '');
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    $fullName = sanitizeInput($_POST['full_name'] ?? '');
    $role = sanitizeInput($_POST['role'] ?? 'client');

    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        jsonError('All required fields must be filled');
    }

    if (strlen($username) < 3) {
        jsonError('Username must be at least 3 characters');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonError('Invalid email address');
    }

    if (strlen($password) < 6) {
        jsonError('Password must be at least 6 characters');
    }

    if ($password !== $confirmPassword) {
        jsonError('Passwords do not match');
    }

    if (!in_array($role, ['client', 'staff'])) {
        jsonError('Invalid role selected');
    }

    try {
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        
        if ($stmt->fetchColumn() > 0) {
            jsonError('Username or email already exists', 409);
        }

        // Create user
        $hashedPassword = hashPassword($password);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$username, $email, $hashedPassword, $role, $fullName]);
        
        $userId = $pdo->lastInsertId();

        // Set session variables
        $_SESSION['user_id'] = $userId;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        $_SESSION['role'] = $role;
        $_SESSION['full_name'] = $fullName;
        $_SESSION['last_activity'] = time();

        logActivity($userId, 'register', 'New user registered');

        jsonSuccess('Registration successful', [
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'role' => $role,
                'full_name' => $fullName
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
    <title>Register - <?php echo SITE_NAME; ?></title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body class="auth-page" data-theme="<?php echo getTheme(); ?>">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <img src="https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a" alt="EzTweak Logo" class="auth-logo" id="theme-logo">
                <h1>Join <?php echo SITE_NAME; ?></h1>
                <p>Create your account</p>
            </div>

            <form id="register-form" class="auth-form">
                <div id="error-message" class="error-message" style="display: none;"></div>
                
                <div class="form-group">
                    <label for="username">Username *</label>
                    <input type="text" id="username" name="username" required minlength="3" placeholder="Choose a username">
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required placeholder="your@email.com">
                </div>

                <div class="form-group">
                    <label for="full_name">Full Name</label>
                    <input type="text" id="full_name" name="full_name" placeholder="Your full name">
                </div>

                <div class="form-group">
                    <label for="role">Account Type *</label>
                    <select id="role" name="role" required>
                        <option value="client">Client</option>
                        <option value="staff">Staff Member</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="password">Password *</label>
                    <input type="password" id="password" name="password" required minlength="6" placeholder="At least 6 characters">
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirm Password *</label>
                    <input type="password" id="confirm_password" name="confirm_password" required placeholder="Repeat your password">
                </div>

                <button type="submit" class="auth-button" id="register-button">
                    <span class="button-text">Register</span>
                    <span class="button-loading" style="display: none;">Creating account...</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>Already have an account? <a href="login.php">Login here</a></p>
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
        document.getElementById('register-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorDiv = document.getElementById('error-message');
            const button = document.getElementById('register-button');
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
                const response = await fetch('register.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Registration successful! Redirecting...', 'success');
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
