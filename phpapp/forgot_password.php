<?php
require_once 'includes/config.php';
require_once 'includes/functions.php';

// If already logged in, redirect to dashboard
if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit();
}

$step = $_GET['step'] ?? 'email';

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ajax'])) {
    $action = $_POST['action'] ?? '';

    if ($action === 'verify_email') {
        $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonError('Invalid email address');
        }

        try {
            $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            // Always return success to avoid email enumeration
            // In production, this would send an email with a reset token
            jsonSuccess('If an account with that email exists, a password reset link has been sent.', [
                'username' => $user ? $user['username'] : null,
                'hasUser' => $user ? true : false
            ]);
        } catch (PDOException $e) {
            jsonError('Server error', 500);
        }
    } elseif ($action === 'reset_password') {
        $username = sanitizeInput($_POST['username'] ?? '');
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';

        if (empty($username) || empty($newPassword)) {
            jsonError('All fields are required');
        }

        if (strlen($newPassword) < 6) {
            jsonError('Password must be at least 6 characters');
        }

        if ($newPassword !== $confirmPassword) {
            jsonError('Passwords do not match');
        }

        try {
            $hashedPassword = hashPassword($newPassword);
            $stmt = $pdo->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE username = ?");
            $stmt->execute([$hashedPassword, $username]);

            if ($stmt->rowCount() === 0) {
                jsonError('User not found', 404);
            }

            // Log the password reset
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user) {
                logActivity($user['id'], 'password_reset', 'Password was reset');
            }

            jsonSuccess('Password updated successfully');
        } catch (PDOException $e) {
            jsonError('Server error', 500);
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - <?php echo SITE_NAME; ?></title>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body class="auth-page" data-theme="<?php echo getTheme(); ?>">
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <img src="https://github.com/user-attachments/assets/3fa3dc03-5260-469a-80cc-a6c392ca3e9a" alt="EzTweak Logo" class="auth-logo" id="theme-logo">
                <h1>Reset Password</h1>
                <p>Recover your account</p>
            </div>

            <!-- Step 1: Email verification -->
            <form id="email-form" class="auth-form" style="display: <?php echo $step === 'email' ? 'block' : 'none'; ?>">
                <div id="error-message-1" class="error-message" style="display: none;"></div>
                <div id="success-message-1" class="success-message" style="display: none;"></div>
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="Enter your email">
                </div>

                <button type="submit" class="auth-button" id="email-button">
                    <span class="button-text">Send Reset Link</span>
                    <span class="button-loading" style="display: none;">Processing...</span>
                </button>

                <div style="display: none;" id="demo-note" class="demo-info">
                    <p><strong>For demo:</strong> Your username is <span id="found-username"></span></p>
                    <button type="button" onclick="showResetForm()" class="auth-button secondary">Continue to Reset Password</button>
                </div>
            </form>

            <!-- Step 2: Reset password -->
            <form id="reset-form" class="auth-form" style="display: <?php echo $step === 'reset' ? 'block' : 'none'; ?>">
                <div id="error-message-2" class="error-message" style="display: none;"></div>
                
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required placeholder="Enter your username">
                </div>

                <div class="form-group">
                    <label for="new_password">New Password</label>
                    <input type="password" id="new_password" name="new_password" required minlength="6" placeholder="At least 6 characters">
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirm Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required placeholder="Repeat new password">
                </div>

                <button type="submit" class="auth-button" id="reset-button">
                    <span class="button-text">Reset Password</span>
                    <span class="button-loading" style="display: none;">Updating...</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>Remember your password? <a href="login.php">Login here</a></p>
                <p>Don't have an account? <a href="register.php">Register here</a></p>
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
        // Email verification form
        document.getElementById('email-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorDiv = document.getElementById('error-message-1');
            const successDiv = document.getElementById('success-message-1');
            const button = document.getElementById('email-button');
            const buttonText = button.querySelector('.button-text');
            const buttonLoading = button.querySelector('.button-loading');
            const demoNote = document.getElementById('demo-note');
            
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            demoNote.style.display = 'none';
            
            button.disabled = true;
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'inline';
            
            const formData = new FormData(this);
            formData.append('ajax', '1');
            formData.append('action', 'verify_email');
            
            try {
                const response = await fetch('forgot_password.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    successDiv.textContent = data.message;
                    successDiv.style.display = 'block';
                    
                    // For demo purposes, show username
                    if (data.hasUser && data.username) {
                        document.getElementById('found-username').textContent = data.username;
                        document.getElementById('username').value = data.username;
                        demoNote.style.display = 'block';
                    }
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.style.display = 'block';
                }
                
                button.disabled = false;
                buttonText.style.display = 'inline';
                buttonLoading.style.display = 'none';
            } catch (error) {
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.style.display = 'block';
                button.disabled = false;
                buttonText.style.display = 'inline';
                buttonLoading.style.display = 'none';
            }
        });

        // Reset password form
        document.getElementById('reset-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorDiv = document.getElementById('error-message-2');
            const button = document.getElementById('reset-button');
            const buttonText = button.querySelector('.button-text');
            const buttonLoading = button.querySelector('.button-loading');
            
            errorDiv.style.display = 'none';
            
            button.disabled = true;
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'inline';
            
            const formData = new FormData(this);
            formData.append('ajax', '1');
            formData.append('action', 'reset_password');
            
            try {
                const response = await fetch('forgot_password.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('Password updated! Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 1500);
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

        function showResetForm() {
            document.getElementById('email-form').style.display = 'none';
            document.getElementById('reset-form').style.display = 'block';
        }
    </script>
</body>
</html>
