<?php
// Installation wizard for EzTweak PHP App
session_start();

// Check if already installed
if (file_exists('includes/config.php')) {
    $config_content = file_get_contents('includes/config.php');
    if (strpos($config_content, 'your_password_here') === false) {
        die('Application already installed. Delete includes/config.php to reinstall.');
    }
}

$step = $_GET['step'] ?? 1;
$error = '';
$success = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['test_connection'])) {
        // Test database connection
        $db_host = $_POST['db_host'] ?? '';
        $db_name = $_POST['db_name'] ?? '';
        $db_user = $_POST['db_user'] ?? '';
        $db_pass = $_POST['db_pass'] ?? '';
        
        try {
            $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
            $success = 'Database connection successful!';
            $_SESSION['db_config'] = [
                'host' => $db_host,
                'name' => $db_name,
                'user' => $db_user,
                'pass' => $db_pass
            ];
        } catch (PDOException $e) {
            $error = 'Database connection failed: ' . $e->getMessage();
        }
    } elseif (isset($_POST['install'])) {
        // Perform installation
        if (!isset($_SESSION['db_config'])) {
            $error = 'Please test database connection first';
        } else {
            $db_config = $_SESSION['db_config'];
            
            // Update config.php
            $config_template = file_get_contents('includes/config.php');
            $config_template = str_replace('localhost', $db_config['host'], $config_template);
            $config_template = str_replace('eztweak_db', $db_config['name'], $config_template);
            $config_template = str_replace('eztweak_user', $db_config['user'], $config_template);
            $config_template = str_replace('your_password_here', $db_config['pass'], $config_template);
            
            // Generate random JWT secret
            $jwt_secret = bin2hex(random_bytes(32));
            $config_template = str_replace('your-secret-key-change-this-in-production', $jwt_secret, $config_template);
            
            file_put_contents('includes/config.php', $config_template);
            
            // Initialize database
            require_once 'includes/config.php';
            require_once 'includes/init_db.php';
            
            if (initializeDatabase($pdo)) {
                if (seedInitialData($pdo)) {
                    $success = 'Installation completed successfully!';
                    $step = 3;
                } else {
                    $error = 'Error seeding initial data';
                }
            } else {
                $error = 'Error creating database tables';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EzTweak Installation Wizard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .install-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        
        .install-header {
            text-align: center;
            margin-bottom: 32px;
        }
        
        .install-header h1 {
            color: #333;
            margin-bottom: 8px;
        }
        
        .install-header p {
            color: #666;
        }
        
        .steps {
            display: flex;
            justify-content: space-between;
            margin-bottom: 32px;
        }
        
        .step {
            flex: 1;
            text-align: center;
            padding: 12px;
            background: #f0f0f0;
            position: relative;
        }
        
        .step.active {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        
        .step.completed {
            background: #28a745;
            color: white;
        }
        
        .step::after {
            content: '';
            position: absolute;
            right: -10px;
            top: 50%;
            transform: translateY(-50%);
            width: 0;
            height: 0;
            border-left: 10px solid #f0f0f0;
            border-top: 20px solid transparent;
            border-bottom: 20px solid transparent;
            z-index: 1;
        }
        
        .step:last-child::after {
            display: none;
        }
        
        .step.active::after {
            border-left-color: #667eea;
        }
        
        .step.completed::after {
            border-left-color: #28a745;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            padding: 14px 28px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-success:hover {
            background: #218838;
        }
        
        .alert {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .info-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 16px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .success-icon {
            text-align: center;
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        .btn-group {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="install-container">
        <div class="install-header">
            <h1>🏥 EzTweak Installation</h1>
            <p>Harm Reduction Order & Case Management System</p>
        </div>
        
        <div class="steps">
            <div class="step <?php echo $step == 1 ? 'active' : ($step > 1 ? 'completed' : ''); ?>">
                Step 1<br>Requirements
            </div>
            <div class="step <?php echo $step == 2 ? 'active' : ($step > 2 ? 'completed' : ''); ?>">
                Step 2<br>Database
            </div>
            <div class="step <?php echo $step == 3 ? 'active' : ''; ?>">
                Step 3<br>Complete
            </div>
        </div>
        
        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>
        
        <?php if ($step == 1): ?>
            <h2>System Requirements</h2>
            <div class="info-box">
                <h3>Before you begin, make sure you have:</h3>
                <ul>
                    <li>✓ PHP 7.4 or higher</li>
                    <li>✓ MySQL 5.7 or higher (or MariaDB 10.2+)</li>
                    <li>✓ PDO PHP Extension</li>
                    <li>✓ Database credentials (host, name, username, password)</li>
                    <li>✓ Write permissions on includes/config.php</li>
                </ul>
            </div>
            
            <h3>Current PHP Version: <?php echo phpversion(); ?></h3>
            <h3>PDO Enabled: <?php echo extension_loaded('pdo_mysql') ? '✓ Yes' : '✗ No'; ?></h3>
            
            <?php if (is_writable('includes/config.php')): ?>
                <h3>Config File Writable: ✓ Yes</h3>
            <?php else: ?>
                <div class="alert alert-error">
                    Config file is not writable. Please run: <code>chmod 666 includes/config.php</code>
                </div>
            <?php endif; ?>
            
            <div class="btn-group">
                <a href="?step=2" class="btn btn-primary">Continue to Database Setup →</a>
            </div>
        
        <?php elseif ($step == 2): ?>
            <h2>Database Configuration</h2>
            <div class="info-box">
                <p>Enter your MySQL database credentials. The database should already exist. If you're using cPanel, create the database through the MySQL Databases tool first.</p>
            </div>
            
            <form method="POST">
                <div class="form-group">
                    <label for="db_host">Database Host</label>
                    <input type="text" id="db_host" name="db_host" value="localhost" required>
                    <small>Usually "localhost" for shared hosting</small>
                </div>
                
                <div class="form-group">
                    <label for="db_name">Database Name</label>
                    <input type="text" id="db_name" name="db_name" value="eztweak_db" required>
                </div>
                
                <div class="form-group">
                    <label for="db_user">Database Username</label>
                    <input type="text" id="db_user" name="db_user" required>
                </div>
                
                <div class="form-group">
                    <label for="db_pass">Database Password</label>
                    <input type="password" id="db_pass" name="db_pass" required>
                </div>
                
                <div class="btn-group">
                    <button type="submit" name="test_connection" class="btn btn-primary">Test Connection</button>
                    <?php if (isset($_SESSION['db_config'])): ?>
                        <button type="submit" name="install" class="btn btn-success">Install Now</button>
                    <?php endif; ?>
                </div>
            </form>
        
        <?php elseif ($step == 3): ?>
            <div class="success-icon">✓</div>
            <h2 style="text-align: center;">Installation Complete!</h2>
            
            <div class="info-box">
                <h3>Default Admin Credentials:</h3>
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
                <p style="color: #d32f2f; margin-top: 12px;"><strong>Important:</strong> Please change the admin password after your first login!</p>
            </div>
            
            <div class="info-box">
                <h3>What's Next?</h3>
                <ul>
                    <li>Log in with the admin credentials above</li>
                    <li>Change the default password</li>
                    <li>Configure your products and settings</li>
                    <li>Create staff and client accounts</li>
                </ul>
            </div>
            
            <div class="info-box">
                <h3>Security Reminder:</h3>
                <p>For security reasons, please delete or rename <code>install.php</code> after installation.</p>
            </div>
            
            <div class="btn-group" style="justify-content: center;">
                <a href="login.php" class="btn btn-primary">Go to Login Page →</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
