    </main>
    
    <footer class="footer">
        <div class="footer-container">
            <p>&copy; <?php echo date('Y'); ?> <?php echo SITE_NAME; ?>. Harm Reduction Order & Case Management System.</p>
            <p>Version 1.0 | <a href="https://github.com/acesonder/EzTweak" target="_blank">GitHub</a></p>
        </div>
    </footer>
    
    <script src="js/main.js"></script>
    <script src="js/dashboard.js"></script>
    <script>
        // Mobile navbar toggle
        document.getElementById('navbar-toggle')?.addEventListener('click', function() {
            document.getElementById('navbar-menu').classList.toggle('active');
        });
        
        // User menu toggle
        function toggleUserMenu() {
            document.getElementById('user-menu').classList.toggle('show');
        }
        
        // Close user menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown')) {
                document.getElementById('user-menu')?.classList.remove('show');
            }
        });
        
        // Notifications panel
        function showNotificationsPanel() {
            const panel = document.getElementById('notifications-panel');
            panel.style.display = 'block';
            loadNotifications();
        }
        
        function closeNotificationsPanel() {
            document.getElementById('notifications-panel').style.display = 'none';
        }
        
        async function loadNotifications() {
            try {
                const data = await EzTweak.fetchJSON('api.php?action=get_notifications');
                const list = document.getElementById('notifications-list');
                
                if (data.success && data.notifications && data.notifications.length > 0) {
                    list.innerHTML = data.notifications.map(n => `
                        <div class="notification-item ${n.type}" onclick="EzTweak.markNotificationRead(${n.id})">
                            <p>${n.message}</p>
                            <small>${EzTweak.formatDate(n.created_at)}</small>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = '<p class="no-notifications">No new notifications</p>';
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        }
    </script>
</body>
</html>
