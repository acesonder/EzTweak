import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Dashboard.css';

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const Notifications: React.FC = () => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock data for demonstration
      const mockNotifications: Notification[] = [
        {
          id: 1,
          user_id: user?.id || 0,
          type: 'order',
          title: 'Order Confirmed',
          message: 'Your order #1234 has been confirmed and is being processed.',
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          user_id: user?.id || 0,
          type: 'reminder',
          title: 'Pickup Reminder',
          message: 'Don\'t forget to pick up your order tomorrow at 2:00 PM.',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          user_id: user?.id || 0,
          type: 'system',
          title: 'System Update',
          message: 'EzTweak has been updated with new features. Check them out!',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 4,
          user_id: user?.id || 0,
          type: 'case',
          title: 'Case Note Added',
          message: 'A new note has been added to your case.',
          read: true,
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      // API call would go here
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // API call would go here
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      // API call would go here
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      order: '📦',
      reminder: '⏰',
      system: '⚙️',
      case: '👥',
      incident: '⚠️',
      message: '💬',
    };
    return iconMap[type] || '📢';
  };

  const getTypeClass = (type: string) => {
    return `notification-type-${type}`;
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>🔔 Notifications</h1>
            {unreadCount > 0 && (
              <p className="subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={markAllAsRead}>
              Mark All as Read
            </button>
          )}
        </div>

        <div className="notifications-filter">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No Notifications</h3>
            <p>
              {filter === 'unread' 
                ? 'You have no unread notifications.' 
                : 'You have no notifications at this time.'}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''} ${getTypeClass(notification.type)}`}
              >
                <div className="notification-icon">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <span className="notification-time">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      className="btn-icon"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

export default Notifications;
