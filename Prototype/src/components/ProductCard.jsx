import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ProductCard({ product }) {
    return (
        <div className="product-card">
            <div className="product-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="product-name" style={{ marginBottom: '0.25rem' }}>{product.name}</h3>
                    {product.iddsi && (
                        <span style={{
                            background: '#0f172a', color: 'white', padding: '0.1rem 0.4rem',
                            borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap'
                        }}>
                            IDDSI {product.iddsi.split(' ')[0]}
                        </span>
                    )}
                </div>

                {product.chameleonName && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
                        ID: {product.chameleonName}
                    </div>
                )}

                <div className="badges">
                    {product.allergens.map(allergen => (
                        <span key={allergen} className="badge badge-danger" title="Contains Allergen">
                            <AlertTriangle size={12} style={{ marginRight: 4 }} />
                            {allergen}
                        </span>
                    ))}
                    {product.mayContain.map(allergen => (
                        <span key={`may-${allergen}`} className="badge" style={{ background: '#fff3cd', color: '#856404' }} title="May Contain">
                            <AlertTriangle size={12} style={{ marginRight: 4 }} />
                            May contain {allergen}
                        </span>
                    ))}
                </div>

                <div className="badges" style={{ marginTop: 'auto' }}>
                    {product.consistency.map(cons => (
                        <span key={cons} className="badge badge-success">
                            <CheckCircle size={12} style={{ marginRight: 4 }} />
                            {cons}
                        </span>
                    ))}
                </div>

                {product.notes && (
                    <div style={{ marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem', color: '#475569', display: 'flex', gap: '0.25rem' }}>
                        <Info size={12} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        {product.notes}
                    </div>
                )}

                <div className="product-meta">
                    <span>{product.calories} kcal</span>
                    <span>{product.protein} protein</span>
                </div>
            </div>
        </div>
    );
}
