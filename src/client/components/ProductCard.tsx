import React from 'react';
import '../styles/ProductCard.css';

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

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, quantity, onAdd, onRemove }) => {
  return (
    <div 
      className="product-card"
      style={{ 
        backgroundColor: product.color,
        color: product.font_color 
      }}
    >
      {/* Remove bubble - top left */}
      {quantity > 0 && (
        <button 
          className="remove-bubble"
          onClick={onRemove}
          title="Remove one"
        >
          -
        </button>
      )}

      {/* Quantity bubble - top right */}
      {quantity > 0 && (
        <div className="quantity-bubble">
          {quantity}
        </div>
      )}

      <div className="product-icon">
        {product.icon_url ? (
          <img src={product.icon_url} alt={product.name} />
        ) : (
          <span className="icon-placeholder">📦</span>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name" style={{ color: product.font_color }}>
          {product.name}
        </h3>
        <p className="product-description" style={{ color: product.font_color }}>
          {product.description}
        </p>
        <div className="product-meta">
          <span className="product-category" style={{ color: product.font_color }}>
            {product.category}
          </span>
          <span 
            className={`product-stock ${product.stock_quantity < 50 ? 'low' : ''}`}
            style={{ color: product.font_color }}
          >
            Stock: {product.stock_quantity}
          </span>
        </div>
      </div>

      <button 
        className="add-button"
        onClick={onAdd}
        disabled={product.stock_quantity === 0}
      >
        {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Order'}
      </button>
    </div>
  );
};

export default ProductCard;
