import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import Navigation from '../components/Navigation';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  stock_quantity: number;
  color: string;
  font_color: string;
  icon_url: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const Products: React.FC = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const newCart = new Map(cart);
    const existing = newCart.get(product.id);
    
    if (existing) {
      newCart.set(product.id, { ...existing, quantity: existing.quantity + 1 });
    } else {
      newCart.set(product.id, { product, quantity: 1 });
    }
    
    setCart(newCart);
  };

  const removeFromCart = (productId: number) => {
    const newCart = new Map(cart);
    const existing = newCart.get(productId);
    
    if (existing && existing.quantity > 1) {
      newCart.set(productId, { ...existing, quantity: existing.quantity - 1 });
    } else {
      newCart.delete(productId);
    }
    
    setCart(newCart);
  };

  const clearCart = () => {
    setCart(new Map());
  };

  const placeOrder = async () => {
    const items = Array.from(cart.values()).map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_type: 'pickup',
          items,
        }),
      });

      if (response.ok) {
        alert('Order placed successfully!');
        clearCart();
      } else {
        alert('Failed to place order');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="page-container">
          <div className="loading">Loading products...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="page-container">
        <div className="products-header">
          <h1>Harm Reduction Supplies</h1>
          <p>Browse and order supplies for your needs</p>
        </div>

        <div className="products-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="products-grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart.get(product.id)?.quantity || 0}
              onAdd={() => addToCart(product)}
              onRemove={() => removeFromCart(product.id)}
            />
          ))}
        </div>

        {totalItems > 0 && (
          <div className="cart-summary">
            <div className="cart-content">
              <h3>Cart Summary</h3>
              <p>{totalItems} item(s) selected</p>
              <div className="cart-actions">
                <button onClick={clearCart} className="btn-clear">Clear Cart</button>
                <button onClick={placeOrder} className="btn-order">Place Order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Products;
