import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import '../styles/Orders.css';

interface Order {
  id: number;
  status: string;
  order_type: string;
  delivery_address: string;
  delivery_date: string;
  notes: string;
  client_name: string;
  staff_name: string;
  created_at: string;
}

const Orders: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading orders...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="orders-header">
          <h1>Order History</h1>
          <p>Track your past and current orders</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>Start by browsing our products and placing an order</p>
            <a href="/products" className="btn-primary">Browse Products</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Order #{order.id}</div>
                  <div 
                    className="order-status"
                    style={{ background: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{order.order_type}</span>
                  </div>
                  
                  {order.delivery_address && (
                    <div className="detail-row">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{order.delivery_address}</span>
                    </div>
                  )}

                  {order.delivery_date && (
                    <div className="detail-row">
                      <span className="detail-label">Scheduled:</span>
                      <span className="detail-value">
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {order.staff_name && (
                    <div className="detail-row">
                      <span className="detail-label">Staff:</span>
                      <span className="detail-value">{order.staff_name}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="detail-label">Placed:</span>
                    <span className="detail-value">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {order.notes && (
                    <div className="order-notes">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <button className="btn-view">View Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
