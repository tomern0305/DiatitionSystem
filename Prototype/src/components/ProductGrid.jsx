import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }) {
    if (products.length === 0) {
        return (
            <div className="scroll-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                <p>No products match your criteria.</p>
            </div>
        );
    }

    return (
        <div className="scroll-area">
            <div className="product-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
